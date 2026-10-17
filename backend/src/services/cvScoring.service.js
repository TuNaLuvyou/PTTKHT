// CvScoringService — plain-JS port of
// backend/src/cv-scoring/cv-scoring.service.ts
//
// Keeps the exact same PDF/Word extraction, prompt construction,
// Gemini API call, JSON parsing and persistence logic.

const mammoth = require('mammoth');

const { prisma } = require('../config/prisma');
const { toDoc, normalizeJson } = require('../utils/serialize');
const { populateRef } = require('../utils/populate');

const notificationsGateway = require('../sockets/notifications.gateway');
const { AppLogger } = require('../utils/logger');
const config = require('../config/env');
const {
  ROLE_MAPPING,
  ROLE_KNOWLEDGE_BASE,
  SKILL_WEIGHTS,
  INDUSTRY_WEIGHT_CONFIG,
  analyzeCVLocal,
} = require('../utils/knowledgeBase');

const logger = AppLogger.forContext('CvScoringService');

let geminiApiKey = null;
const GEMINI_MODEL = 'gemini-3.1-flash-lite';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models`;

(function init() {
  const apiKey = config.geminiApiKey;
  if (apiKey) {
    geminiApiKey = apiKey;
    logger.success('Gemini AI configured', { action: 'init' });
  } else {
    logger.warn('GEMINI_API_KEY không được cấu hình. Sẽ dùng local fallback.', {
      action: 'init',
    });
  }
})();

// ─── AI Settings from DB ──────────────────────────────────────────────

async function getAiSettings() {
  const defaults = {
    cvScoreEnabled: true,
    maxFileSizeMB: 10,
    supportedFormats: ['pdf', 'doc', 'docx'],
    processingTimeoutSec: 60,
    dailyScoreLimit: 5,
  };
  try {
    const doc = await prisma.settings.findUnique({ where: { key: 'global' } });
    if (!doc) return defaults;
    const ai = doc.ai || {};
    return { ...defaults, ...ai };
  } catch {
    return defaults;
  }
}

async function checkDailyScoreLimit(userId) {
  const settings = await getAiSettings();
  if (!settings.cvScoreEnabled) {
    return { allowed: false, used: 0, limit: 0 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const count = await prisma.cvScore.count({
    where: { userId: String(userId), createdAt: { gte: today, lt: tomorrow } },
  });

  const remaining = settings.dailyScoreLimit - count;
  return {
    allowed: remaining > 0,
    used: count,
    limit: settings.dailyScoreLimit,
  };
}

async function findScoreById(id) {
  try {
    const row = await prisma.cvScore.findUnique({ where: { id: String(id) } });
    return toDoc(row);
  } catch {
    return null;
  }
}

async function findScoreByCvUrl(cvUrl) {
  try {
    const row = await prisma.cvScore.findFirst({
      where: { cvUrl },
      orderBy: { createdAt: 'desc' },
    });
    return toDoc(row);
  } catch {
    return null;
  }
}

async function callGemini(prompt) {
  if (!geminiApiKey) return null;
  const url = `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${geminiApiKey}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    });
    if (!response.ok) {
      const errBody = await response.text();
      logger.error(`Gemini API error ${response.status}: ${errBody}`);
      return null;
    }
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch (err) {
    logger.error('Failed to call Gemini API', err);
    return null;
  }
}

// Clean up Vietnamese text extracted from PDFs.
// PDF text extraction often produces garbled Unicode due to font encoding issues.
// This function attempts to fix common problems:
// - Unicode normalization (NFD -> NFC) to fix decomposed Vietnamese characters
// - Removing excessive replacement characters (\uFFFD)
// - Normalizing whitespace
function cleanupVietnameseText(text) {
  if (!text || text.length === 0) return text;

  let cleaned = text;

  // 1. Normalize Unicode to composed form (NFC)
  // Many PDFs store Vietnamese as NFD (decomposed) which causes regex issues
  cleaned = cleaned.normalize('NFC');

  // 2. Remove Unicode replacement characters (common in broken font encoding)
  cleaned = cleaned.replace(/\uFFFD/g, '');

  // 3. Collapse multiple spaces and trim
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // 4. Fix line breaks - ensure proper line separation
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned;
}

async function parsePdf(buffer, fileName = 'uploaded_cv.pdf') {
  try {
    const lowerName = fileName.toLowerCase();
    if (lowerName.endsWith('.docx') || lowerName.endsWith('.doc')) {
      const result = await mammoth.extractRawText({ buffer });
      return cleanupVietnameseText(result.value);
    }

    // Use pdfjs-dist (v5+) for robust PDF text extraction.
    // Dynamic import because pdfjs-dist v5 is ESM-only.
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const uint8Array = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdfDocument = await loadingTask.promise;

    const pages = [];
    const Y_TOLERANCE = 5; // tolerance in PDF units for items on the same line

    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const content = await page.getTextContent();

      // Get text items only (filter out marked content items)
      const textItems = content.items.filter(
        (item) => item.str !== undefined && item.transform !== undefined,
      );

      // Sort by Y-position (descending = top-to-bottom in PDF coords)
      // then X-position (ascending = left-to-right)
      const sortedItems = [...textItems].sort((a, b) => {
        const yDiff = b.transform[5] - a.transform[5];
        if (Math.abs(yDiff) > Y_TOLERANCE) return yDiff; // different line
        return a.transform[4] - b.transform[4]; // same line, left-to-right
      });

      // Build text with proper line breaks based on Y-position changes
      const lineParts = [];
      let currentLine = [];
      let lastY = null;

      for (const item of sortedItems) {
        const y = item.transform[5];
        const str = item.str || '';

        if (lastY !== null && Math.abs(y - lastY) > Y_TOLERANCE) {
          // Y changed significantly -> new line
          lineParts.push(currentLine.join(' ').replace(/\s+/g, ' ').trim());
          currentLine = [];
        }

        currentLine.push(str);
        lastY = y;
      }

      // Don't forget the last line
      if (currentLine.length > 0) {
        lineParts.push(currentLine.join(' ').replace(/\s+/g, ' ').trim());
      }

      const pageText = lineParts.join('\n');

      pages.push(pageText);
    }

    const rawText = pages.join('\n\n');
    return cleanupVietnameseText(rawText);
  } catch (error) {
    logger.error('Failed to parse document', error);
    throw new Error(
      'Failed to parse document. Ensure it is a valid PDF or Word file.',
    );
  }
}

async function findExistingScore(userId, jobId, cvUrl) {
  const where = { userId: String(userId) };
  if (jobId) where.jobId = String(jobId);
  if (cvUrl) where.cvUrl = cvUrl;

  // Find the most recent score for this user/job/cv
  const row = await prisma.cvScore.findFirst({
    where,
    orderBy: { createdAt: 'desc' },
  });
  return toDoc(row);
}

async function saveScore(userId, result, type, jobId, cvUrl, pdfBuffer) {
  const scoreValue = result.overall || result.score || 0;
  // Normalize grade: A+, B+ -> A, B, etc.
  const gradeValue = result.grade ? String(result.grade).replace('+', '') : 'N/A';
  const saved = await prisma.cvScore.create({
    data: {
      userId: userId ? String(userId) : undefined,
      jobId: jobId ? String(jobId) : undefined,
      cvUrl: cvUrl || 'default_cv',
      score: scoreValue,
      overall: scoreValue,
      grade: gradeValue,
      analysis: normalizeJson(result),
      type,
      pdfBuffer,
      // Columns Mongoose used to fill from schema defaults.
      recommended_roles: result.recommended_roles || [],
      strengths: result.strengths || [],
      improvements: result.improvements || [],
      skill_analysis: normalizeJson(result.skill_analysis) || {
        advanced: [],
        familiar: [],
      },
    },
  });

  // Emit realtime update for admin dashboard
  try {
    notificationsGateway.emitDashboardUpdateNeeded();
  } catch (e) {
    logger.warn('Failed to emit dashboard update via WebSocket', e);
  }

  return toDoc(saved);
}

function scoreByKeywords(cvText, job) {
  const requirements = job.requirements || [];
  const tags = job.tags || [];
  const allKeywords = [...new Set([...requirements, ...tags])].filter(
    (k) => k && k.trim() !== '',
  );

  if (allKeywords.length === 0) return 0; // Cannot score by keywords

  const cvLower = cvText.toLowerCase();
  // Also create a fuzzy-normalized version for matching
  const cvFuzzy = cvLower.replace(/[-._\s]+/g, '');

  let matches = 0;

  for (const keyword of allKeywords) {
    const kw = keyword.toLowerCase().trim();
    // Exact match
    if (cvLower.includes(kw)) {
      matches++;
      continue;
    }
    // Fuzzy match: strip dots/dashes/spaces (only for multi-char keywords)
    const kwFuzzy = kw.replace(/[-._\s]+/g, '');
    if (kwFuzzy.length >= 4 && cvFuzzy.includes(kwFuzzy)) {
      matches++;
    }
  }

  const ratio = matches / allKeywords.length;

  // Use exponential curve so matching ~30% of keywords -> ~78% of max score
  // matching ~15% of keywords -> ~53% of max score (still decent)
  const effectiveRatio = 1 - Math.exp(-5 * ratio);
  // effectiveRatio is 0..1, scale to 1..10 score
  const rawScore = effectiveRatio * 10;
  return Math.max(1, Math.min(10, Math.round(rawScore)));
}

function detectRole(cvText, jobContext, targetPosition) {
  const textToSearch = `${jobContext?.title || ''} ${targetPosition || ''} ${jobContext?.description || ''}`.toLowerCase();

  // First, look for matches in the job context or target position
  for (const [key, mappedVal] of Object.entries(ROLE_MAPPING)) {
    if (textToSearch.includes(key)) {
      return Array.isArray(mappedVal) ? mappedVal[0] : mappedVal;
    }
  }

  // If not found, scan the CV text
  const cvLower = cvText.toLowerCase();
  const roleCounts = {};

  for (const [key, mappedVal] of Object.entries(ROLE_MAPPING)) {
    const roles = Array.isArray(mappedVal) ? mappedVal : [mappedVal];
    // Count frequency of this role term in CV
    const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const matches = cvLower.match(new RegExp(`\\b${escapedKey}\\b`, 'gi'));
    if (matches) {
      for (const role of roles) {
        roleCounts[role] = (roleCounts[role] || 0) + matches.length;
      }
    }
  }

  // Find highest frequency role
  let bestRole = 'backend'; // default fallback
  let maxCount = 0;
  for (const [role, count] of Object.entries(roleCounts)) {
    if (count > maxCount) {
      maxCount = count;
      bestRole = role;
    }
  }
  return bestRole;
}

function getTopKeywords(role) {
  const keywords = ROLE_KNOWLEDGE_BASE[role] || [];
  const weights = SKILL_WEIGHTS[role] || {};

  // Sort keywords: higher weight first, fallback to 1 if not in weights
  const sorted = [...keywords].sort((a, b) => {
    const weightA = weights[a] || 1;
    const weightB = weights[b] || 1;
    return weightB - weightA;
  });

  return sorted.slice(0, 10);
}

function buildIndustryWeightedPrompt(cvText, role, jobContext) {
  const industryConfig = INDUSTRY_WEIGHT_CONFIG[role];
  if (!industryConfig) return '';

  return `
### TIÊU CHÍ ƯU TIÊN THEO NGÀNH NGHỀ (${role.toUpperCase()}):
- ${industryConfig.description}
- Kỹ năng/Công nghệ/Kế hoạch được ĐÁNH GIÁ CAO (Trọng số cao): ${industryConfig.priority.join(', ')}
- Kỹ năng/Công nghệ được xem là THỨ YẾU/PHỤ TRỢ (Trọng số thấp): ${industryConfig.secondary.join(', ')}
- Hãy đặc biệt lưu ý: đánh giá mức độ thành thạo thực sự dựa trên sự xuất hiện và mô tả các kỹ năng trọng yếu trong các dự án thực tế, không chỉ dựa trên danh sách liệt kê.
`;
}

async function scoreCV(pdfBuffer, job, candidateId) {
  const fileName = 'uploaded_cv.pdf'; // Default or from file if available

  // 1. Check for existing score from candidate for this job
  if (candidateId) {
    const existing = await findExistingScore(candidateId, job._id.toString());
    // Skip reuse if the existing score is a stub (created during application upload, not actually scored)
    if (existing && existing.analysis && (existing.overall ?? 0) > 0) {
      logger.log('Tái sử dụng điểm số AI có sẵn', {
        action: 'reuse_score',
        userId: candidateId,
        jobTitle: job.title,
      });

      // Generate contextual evaluation based on existing analysis
      const employerContext = await generateEmployerContext(
        existing.analysis,
        job,
      );

      // Save generated recruiter review back into the score model
      const updatedAnalysis = {
        ...(existing.analysis || {}),
        review:
          employerContext.evaluation ||
          existing.analysis.review ||
          'Đã duyệt qua hồ sơ',
        feedback:
          employerContext.evaluation ||
          existing.analysis.feedback ||
          'Đã duyệt qua hồ sơ',
        employer_insight: employerContext.employer_insight,
      };
      await prisma.cvScore.update({
        where: { id: String(existing._id) },
        data: {
          analysis: normalizeJson(updatedAnalysis),
          type: 'employer_match',
        },
      });

      // Make sure it is linked to the Application
      await prisma.application.updateMany({
        where: { jobId: String(job._id), candidateId: String(candidateId) },
        data: { aiScoreId: String(existing._id) },
      });

      return {
        ...updatedAnalysis,
        score: existing.score || 0,
        review: updatedAnalysis.review,
        reused: true,
      };
    }
  }

  const cvText = await parsePdf(pdfBuffer);

  // Step 1: Local Knowledge Base match
  const localScore = scoreByKeywords(cvText, job);

  // Step 2: Use Gemini for deep analysis
  if (geminiApiKey) {
    const detectedRole = detectRole(cvText, job);
    const topKeywords = getTopKeywords(detectedRole);
    const industryWeightedPrompt = buildIndustryWeightedPrompt(
      cvText,
      detectedRole,
      job,
    );

    const prompt = `
Bạn là một Head of Talent Acquisition với 10 năm kinh nghiệm tuyển dụng IT. Hãy đánh giá CV của ứng viên so với yêu cầu công việc cụ thể dành cho NHÀ TUYỂN DỤNG dưới góc độ TRI THỨC chuyên ngành.

---
### BỐI CẢNH & THÔNG TIN TUYỂN DỤNG:
- Vị trí tuyển dụng: ${job.title}
- Mô tả công việc (JD): ${job.description || 'N/A'}
${job.requirements && job.requirements.length > 0 ? `- Yêu cầu công việc:\n  + ${job.requirements.join('\n  + ')}` : ''}
${job.tags && job.tags.length > 0 ? `- Từ khóa cốt lõi của JD: ${job.tags.join(', ')}` : ''}

---
### NGUYÊN TẮC SUY LUẬN TRI THỨC (BẮT BUỘC):
1. **Kiểm tra tính hợp lệ của CV (Spam Check)**: Kiểm tra xem văn bản dưới đây có THỰC SỰ là một bản Sơ yếu lý lịch (CV/Resume) hay không. Nếu văn bản là rác, bài báo, tài liệu linh tinh, hãy trả về JSON với "isValidCv": false và nêu rõ lý do tại "spamReason".
2. **Kỹ năng thực dùng vs. Chỉ liệt kê**: 
   - Kỹ năng CÓ DÙNG THẬT: xuất hiện trực tiếp trong phần mô tả công việc, dự án cụ thể, có vai trò, đóng góp hoặc kết quả rõ ràng.
   - Kỹ năng CHỈ LIỆT KÊ: Chỉ ghi ở phần "Kỹ năng/Skills" mà không được nhắc đến hay chứng minh trong bất kỳ dự án hoặc kinh nghiệm thực tế nào.
   - Hãy phân tích và phân loại rõ ràng trong trường "skill_analysis".
3. **Suy ra LEVEL thực tế (Intern / Fresher / Junior / Middle / Senior / Lead)**: 
   - Đánh giá dựa trên độ phức tạp của công việc đã làm, kiến trúc hệ thống, mức độ tự chủ trong công việc và các quyết định kỹ thuật đã đưa ra, CHỨ KHÔNG DỰA VÀO số năm kinh nghiệm ghi trong CV.
   - Nêu rõ lý do xác định level này trong phần "level_assessment_reason".
4. **Nhận xét chất lượng dự án (Project Quality)**: Đánh giá quy mô dự án (lượng user, traffic, database size, complexity), công nghệ sử dụng, vai trò của ứng viên (lead, key member, support) và các đóng góp có rõ ràng, đo lường được bằng số liệu không.
5. **Đề xuất 3 vị trí phù hợp nhất**: Đề xuất 3 vị trí IT phù hợp nhất với năng lực hiện tại của ứng viên.
6. **Insight cho nhà tuyển dụng (employer_insight)**:
   - "hire_recommendation": Trả về một trong ba giá trị: "Nên mời phỏng vấn", "Cân nhắc", hoặc "Không phù hợp".
   - "interview_focus": Đưa ra danh sách 2-4 câu hỏi/chủ đề kỹ thuật cần tập trung xoáy sâu khi phỏng vấn ứng viên này (ví dụ: hỏi về những điểm nghi vấn trong CV, hoặc kiểm tra sâu kỹ năng thế mạnh/kỹ năng chỉ liệt kê).
   - "onboarding_risk": Nêu rõ rủi ro/khó khăn có thể gặp phải nếu tuyển dụng ứng viên này (ví dụ: thiếu kinh nghiệm thực tế với cloud, thiếu tư duy thiết kế hệ thống, cần training thêm mảng bảo mật...).

---
### TIÊU CHÍ ĐÁNH GIÁ ƯU TIÊN VỊ TRÍ ${detectedRole.toUpperCase()}:
Với vị trí này, các kỹ năng cốt lõi cần đánh giá ưu tiên là: ${topKeywords.join(', ')}. Hãy chú trọng đánh giá mức độ thành thạo thực sự của ứng viên với các kỹ năng này.
${industryWeightedPrompt}

---
### NỘI DUNG VĂN BẢN CV CỦA ỨNG VIÊN:
${cvText}

---
### YÊU CẦU OUTPUT:
Hãy phân tích và trả về kết quả dưới dạng JSON duy nhất, khớp chính xác cấu trúc sau. Nhận xét và phản hồi phải bằng tiếng Việt.

{
  "isValidCv": true,
  "spamReason": "",
  "overall": (số từ 1-100 đại diện cho điểm tổng quan phù hợp với JD hoặc vị trí ứng tuyển),
  "grade": "A/B/C/D",
  "gradeLabel": "Tốt/Khá/Trung bình/Yếu",
  "level_assessment": "Intern / Fresher / Junior / Middle / Senior / Lead",
  "level_assessment_reason": "Lý do xác định level dựa trên độ phức tạp công việc đã làm",
  "recommended_roles": ["Vị trí phù hợp nhất 1", "Vị trí phù hợp nhất 2", "Vị trí phù hợp nhất 3"],
  "project_quality": "Nhận xét chất lượng dự án: quy mô, công nghệ, vai trò đóng góp có rõ ràng không",
  "skill_analysis": {
    "used_in_projects": ["kỹ năng/công nghệ có dùng thực sự trong dự án/mô tả công việc"],
    "listed_only": ["kỹ năng/công nghệ chỉ liệt kê ở phần kỹ năng mà không thấy dùng trong dự án"]
  },
  "strengths": ["điểm mạnh thực tế 1", "điểm mạnh thực tế 2"],
  "improvements": ["điểm cần cải thiện/học thêm 1", "điểm cần cải thiện/học thêm 2"],
  "review": "Bản nhận xét tổng quan ngắn gọn về CV dưới góc nhìn nhà tuyển dụng (tiếng Việt, từ 3-5 câu)",
  "categories": [
    {
      "key": "skills_match",
      "label": "Kỹ năng phù hợp",
      "score": (số từ 0-100),
      "feedback": "Phản hồi chi tiết về sự phù hợp kỹ năng",
      "suggestions": ["Gợi ý cải thiện kỹ năng 1", "Gợi ý 2"]
    },
    {
      "key": "experience",
      "label": "Kinh nghiệm làm việc",
      "score": (số từ 0-100),
      "feedback": "Phản hồi chi tiết về kinh nghiệm và độ phức tạp công việc đã làm",
      "suggestions": ["Gợi ý cải thiện kinh nghiệm 1", "Gợi ý 2"]
    },
    {
      "key": "education",
      "label": "Học vấn & Chứng chỉ",
      "score": (số từ 0-100),
      "feedback": "Phản hồi chi tiết về học vấn, ngành học và chứng chỉ chuyên môn",
      "suggestions": ["Gợi ý học tập/lấy chứng chỉ 1"]
    },
    {
      "key": "format",
      "label": "Định dạng & Trình bày",
      "score": (số từ 0-100),
      "feedback": "Phản hồi chi tiết về bố cục, ngữ pháp, độ dài CV",
      "suggestions": ["Gợi ý trình bày 1"]
    },
    {
      "key": "keywords",
      "label": "Từ khóa & ATS",
      "score": (số từ 0-100),
      "feedback": "Phản hồi về mức độ bao phủ từ khóa so với vị trí/JD",
      "suggestions": ["Gợi ý bổ sung từ khóa cốt lõi 1"]
    }
  ],
  "employer_insight": {
    "hire_recommendation": "Nên mời phỏng vấn / Cân nhắc / Không phù hợp",
    "interview_focus": ["Điểm cần hỏi sâu khi phỏng vấn 1", "Điểm 2"],
    "onboarding_risk": "Rủi ro nếu tuyển: ứng viên có thể thiếu gì"
  }
}
`;
    const responseText = await callGemini(prompt);
    if (responseText) {
      try {
        const cleaned = responseText
          .replace(/^```json\s*/i, '')
          .replace(/\s*```$/i, '');
        const parsed = JSON.parse(cleaned);

        if (parsed.isValidCv === false) {
          throw new Error(
            `SPAM_CV:${parsed.spamReason || 'Tài liệu tải lên không giống một bản CV hợp lệ. Vui lòng kiểm tra lại.'}`,
          );
        }

        const aiScore = parsed.overall ? parsed.overall / 10 : localScore;
        const finalScore = Math.max(1, Math.min(10, Math.round(aiScore)));
        const review = parsed.review || 'Không có nhận xét chi tiết từ AI.';

        const finalResult = {
          id: 'cv_score_' + Date.now(),
          fileName,
          scoredAt: new Date().toISOString(),
          ...parsed,
        };

        if (candidateId) {
          const saved = await saveScore(
            candidateId,
            finalResult,
            'employer_match',
            job._id.toString(),
            'employer_uploaded.pdf',
            pdfBuffer,
          );

          await prisma.application.updateMany({
            where: { jobId: String(job._id), candidateId: String(candidateId) },
            data: { aiScoreId: String(saved._id), cvId: String(saved._id) },
          });
          finalResult.id = String(saved._id);
        }

        return {
          score: finalScore,
          review,
          ...finalResult,
        };
      } catch (parseError) {
        if (parseError.message && parseError.message.startsWith('SPAM_CV:')) {
          throw new Error(parseError.message.replace('SPAM_CV:', ''));
        }
        logger.fail('Parse JSON từ Gemini thất bại (employer)', {
          action: 'score_cv',
          error: parseError.message,
        });
      }
    }
  }

  // Fallback if Gemini is not configured or failed
  logger.warn('Dùng local fallback scoring (không có Gemini)', {
    action: 'score_cv_fallback',
  });
  const matchPercentage = Math.round((localScore / 10) * 100);
  const fallbackReview = `Đánh giá tự động: CV của ứng viên khớp khoảng ${matchPercentage}% từ khóa yêu cầu của công việc.`;

  const overall = localScore * 10;
  const fallbackResult = {
    isValidCv: true,
    spamReason: '',
    overall,
    grade:
      overall >= 85 ? 'A' : overall >= 70 ? 'B' : overall >= 55 ? 'C' : 'D',
    gradeLabel:
      overall >= 85
        ? 'Tốt'
        : overall >= 70
          ? 'Khá'
          : overall >= 55
            ? 'Trung bình'
            : 'Yếu',
    level_assessment: 'Junior',
    level_assessment_reason: 'Xác định tự động qua từ khóa cục bộ',
    recommended_roles: [job.title],
    project_quality: 'Chưa thể đánh giá chi tiết qua fallback cục bộ',
    skill_analysis: {
      used_in_projects: [],
      listed_only: [],
    },
    strengths: ['Khớp từ khóa tốt'],
    improvements: ['Cần rà soát và bổ sung chi tiết theo yêu cầu tuyển dụng'],
    review: fallbackReview,
    categories: [
      { key: 'skills_match', label: 'Kỹ năng', score: overall },
      { key: 'experience', label: 'Kinh nghiệm', score: overall },
      { key: 'education', label: 'Học vấn', score: overall },
      { key: 'format', label: 'Trình bày', score: overall },
      { key: 'keywords', label: 'Từ khóa ATS', score: overall },
    ],
    employer_insight: {
      hire_recommendation: overall >= 70 ? 'Cân nhắc' : 'Không phù hợp',
      interview_focus: ['Kiểm tra các kỹ năng thực tế dự án'],
      onboarding_risk:
        'Cần đánh giá kỹ lưỡng hơn do dùng hệ thống tự động fallback',
    },
  };

  if (candidateId) {
    const saved = await saveScore(
      candidateId,
      fallbackResult,
      'employer_match',
      job._id.toString(),
      'employer_uploaded.pdf',
      pdfBuffer,
    );

    await prisma.application.updateMany({
      where: { jobId: String(job._id), candidateId: String(candidateId) },
      data: { aiScoreId: String(saved._id), cvId: String(saved._id) },
    });
  }

  return {
    score: localScore,
    review: fallbackReview,
  };
}

async function generateEmployerContext(existingAnalysis, job) {
  if (!existingAnalysis) {
    return {
      evaluation:
        'Không có dữ liệu phân tích trước đó cho ứng viên này. Tiến hành chấm điểm mới...',
      employer_insight: {
        hire_recommendation: 'Cân nhắc',
        interview_focus: ['Kiểm tra các dự án thực tế'],
        onboarding_risk: 'Thiếu thông tin chi tiết',
      },
    };
  }
  const prompt = `
Bạn là một Head of Talent Acquisition với 10 năm kinh nghiệm tuyển dụng IT. Dưới đây là kết quả phân tích CV của một ứng viên cho vị trí: ${job.title}.

Dữ liệu phân tích hiện có:
- Điểm tổng quát: ${existingAnalysis.overall || existingAnalysis.score}/100
- Điểm mạnh: ${existingAnalysis.strengths?.join(', ') || 'Không có dữ liệu'}
- Cần cải thiện: ${existingAnalysis.improvements?.join(', ') || 'Không có dữ liệu'}
- Nhận xét chi tiết: ${existingAnalysis.categories?.map((c) => c.feedback).join('; ') || 'Không có dữ liệu'}

Hãy viết một bản đánh giá và phân tích dành riêng cho Nhà tuyển dụng.
Trả về JSON theo định dạng chính xác sau (vui lòng phản hồi bằng tiếng Việt):
{
  "evaluation": "nội dung đánh giá cụ thể (khoảng 3-4 câu, tiếng Việt)",
  "employer_insight": {
    "hire_recommendation": "Nên mời phỏng vấn / Cân nhắc / Không phù hợp",
    "interview_focus": ["Điểm cần hỏi sâu khi phỏng vấn 1", "Điểm 2"],
    "onboarding_risk": "Rủi ro nếu tuyển: ứng viên có thể thiếu gì"
  }
}
`;
  const result = await callGemini(prompt);
  if (result) {
    try {
      const cleaned = result
        .replace(/^```json\s*/i, '')
        .replace(/\s*```$/i, '');
      const parsed = JSON.parse(cleaned);
      return {
        evaluation:
          parsed.evaluation ||
          parsed.review ||
          parsed.text ||
          'Nhận xét tự động từ AI.',
        employer_insight: parsed.employer_insight || {
          hire_recommendation: 'Cân nhắc',
          interview_focus: [
            'Kiểm tra các dự án thực tế trong CV',
            'Xác minh các kỹ năng chuyên môn',
          ],
          onboarding_risk: 'Cần đánh giá thêm trong quá trình thử việc',
        },
      };
    } catch (err) {
      logger.error('Failed to parse employer context JSON', err);
    }
  }

  // Fallback if callGemini fails
  const scoreVal = existingAnalysis.overall || existingAnalysis.score || 50;
  return {
    evaluation:
      'Tái sử dụng phân tích hiện tại của ứng viên. Vui lòng xem chi tiết điểm số.',
    employer_insight: {
      hire_recommendation:
        scoreVal >= 80
          ? 'Nên mời phỏng vấn'
          : scoreVal >= 60
            ? 'Cân nhắc'
            : 'Không phù hợp',
      interview_focus: [
        'Kiểm tra các dự án thực tế trong CV',
        'Kiểm tra mức độ thành thạo kỹ năng cốt lõi',
      ],
      onboarding_risk: 'Cần xác minh kinh nghiệm thực tế',
    },
  };
}

function evaluateCandidateLocalScore(cvText, targetPosition, fileName, jobContext) {
  // Use the advanced fallback engine from knowledge-base.ts
  // Try to extract a valid role key from the target position string
  const posLower = targetPosition.toLowerCase();
  let targetRole;
  for (const [key] of Object.entries(ROLE_MAPPING)) {
    if (posLower.includes(key)) {
      targetRole = key;
      break;
    }
  }

  const analysisResult = analyzeCVLocal(cvText, targetRole || targetPosition);

  // If jobContext is provided, augment the skills analysis with job-specific requirements/tags
  if (
    jobContext &&
    (jobContext.requirements?.length || jobContext.tags?.length)
  ) {
    const jobKeywords = [
      ...(jobContext.requirements || []),
      ...(jobContext.tags || []),
    ].filter((k) => k && k.trim() !== '');
    const textLower = cvText.toLowerCase();
    let jobMatches = 0;
    for (const kw of jobKeywords) {
      if (textLower.includes(kw.toLowerCase())) jobMatches++;
    }
    const jobMatchRatio =
      jobKeywords.length > 0 ? jobMatches / jobKeywords.length : 0.5;

    // Blend the knowledge-base skills score with job-specific match (weighted 70% KB, 30% job-specific)
    const kbSkillsScore = analysisResult.breakdown.skills.score;
    const jobSkillsScore = Math.round(
      jobMatchRatio * analysisResult.breakdown.skills.maxScore,
    );
    const blendedSkillsScore = Math.round(
      kbSkillsScore * 0.7 + jobSkillsScore * 0.3,
    );
    analysisResult.breakdown.skills.score = Math.min(
      blendedSkillsScore,
      analysisResult.breakdown.skills.maxScore,
    );

    // Recalculate overall score since skills weight changed
    const rawTotal =
      analysisResult.breakdown.skills.score +
      analysisResult.breakdown.experience.score +
      analysisResult.breakdown.education.score +
      analysisResult.breakdown.certifications.score +
      analysisResult.breakdown.softSkills.score +
      analysisResult.breakdown.presentation.score;
    analysisResult.overallScore = Math.min(
      Math.max(Math.round(rawTotal), 0),
      100,
    );

    // Recalculate grade to match the adjusted overall score
    // Standard thresholds: A>=85, B>=70, C>=55, D<55
    const g = analysisResult.overallScore;
    if (g >= 85) analysisResult.grade = 'A';
    else if (g >= 70) analysisResult.grade = 'B';
    else if (g >= 55) analysisResult.grade = 'C';
    else analysisResult.grade = 'D';
  }

  // Transform CVAnalysisResult to the legacy format expected by the frontend
  return transformAnalysisResult(analysisResult, fileName, targetPosition);
}

// Transform CVAnalysisResult (from analyzeCVLocal) into the format
// expected by the frontend (with categories, icons, etc.)
function transformAnalysisResult(result, fileName, targetPosition) {
  const { overallScore, grade, breakdown, strengths, improvements } = result;

  // Grade label mapping — consistent with system-wide standard
  // A>=85: Tốt, B>=70: Khá, C>=55: Trung bình, D<55: Yếu
  const gradeLabelMap = {
    A: 'Tốt',
    B: 'Khá',
    C: 'Trung bình',
    D: 'Yếu',
  };

  // Simplify grade: A+ -> A, B+ -> B, C+ -> C (frontend uses simple grades)
  const simpleGrade = (grade || 'D').replace('+', '');

  // Build 5 categories from the advanced breakdown
  const categories = [
    {
      key: 'skills_match',
      label: 'Kỹ năng phù hợp',
      score: breakdown.skills?.score ?? 50,
      icon: '🎯',
      feedback:
        (breakdown.skills?.matchedKeywords?.length ?? 0) > 0
          ? `Đáp ứng ${breakdown.skills.matchedKeywords.length} kỹ năng phù hợp`
          : (breakdown.skills?.missingKeywords?.length ?? 0) > 0
            ? `Thiếu kỹ năng quan trọng: ${breakdown.skills.missingKeywords.slice(0, 4).join(', ')}`
            : 'Cần bổ sung thêm kỹ năng chuyên môn',
      suggestions:
        (breakdown.skills?.missingKeywords?.length ?? 0) > 0
          ? breakdown.skills.missingKeywords
              .slice(0, 3)
              .map((k) => `Bổ sung: ${k}`)
          : ['Duy trì cập nhật kỹ năng mới'],
    },
    {
      key: 'experience',
      label: 'Kinh nghiệm làm việc',
      score: breakdown.experience?.score ?? 50,
      icon: '💼',
      feedback:
        breakdown.experience?.details?.length > 0
          ? breakdown.experience.details.join('. ')
          : 'Kinh nghiệm cần được mô tả chi tiết hơn',
      suggestions: [
        'Thêm kết quả đạt được (số liệu cụ thể)',
        'Mô tả rõ vai trò trong từng dự án',
      ],
    },
    {
      key: 'education',
      label: 'Học vấn & Chứng chỉ',
      score: Math.min(
        100,
        (breakdown.education?.score ?? 0) +
          ((breakdown.certifications?.found?.length ?? 0) > 0 ? 15 : 0),
      ),
      icon: '🎓',
      feedback:
        breakdown.education?.detected &&
        breakdown.education.detected !== 'Không phát hiện'
          ? `Phát hiện: ${breakdown.education.detected}${(breakdown.certifications?.found?.length ?? 0) > 0 ? '. Chứng chỉ: ' + breakdown.certifications.found.join(', ') : ''}`
          : 'Thiếu thông tin học vấn',
      suggestions:
        (breakdown.certifications?.found?.length ?? 0) === 0
          ? ['Cân nhắc lấy chứng chỉ chuyên ngành (AWS, GCP, PMP...)']
          : ['Duy trì và cập nhật chứng chỉ'],
    },
    {
      key: 'format',
      label: 'Định dạng & Trình bày',
      score: breakdown.presentation?.score ?? 50,
      icon: '📄',
      feedback:
        (breakdown.presentation?.sectionsFound?.length ?? 0) > 0
          ? `Phát hiện các phần: ${breakdown.presentation.sectionsFound.join(', ')}`
          : 'Bố cục chưa rõ ràng',
      suggestions:
        (breakdown.presentation?.sectionsMissing?.length ?? 0) > 0
          ? [`Bổ sung: ${breakdown.presentation.sectionsMissing.join(', ')}`]
          : ['Giữ CV trong 1-2 trang', 'Sử dụng font chuẩn'],
    },
    {
      key: 'keywords',
      label: 'Từ khóa & ATS',
      score: Math.min(
        100,
        Math.round(
          ((breakdown.skills?.score ?? 0) + (breakdown.presentation?.score ?? 0)) /
            2,
        ),
      ),
      icon: '🔍',
      feedback:
        (breakdown.skills?.matchedKeywords?.length ?? 0) > 0
          ? `CV chứa ${breakdown.skills.matchedKeywords.length} từ khóa phù hợp`
          : 'CV thiếu nhiều từ khóa quan trọng',
      suggestions: [
        'Sử dụng từ khóa đúng như JD yêu cầu',
        'Bổ sung thuật ngữ ngành phổ biến',
      ],
    },
  ];

  return {
    id: 'cv_score_' + Date.now(),
    fileName,
    scoredAt: new Date().toISOString(),
    overall: overallScore ?? 50,
    grade: simpleGrade,
    gradeLabel: gradeLabelMap[simpleGrade] || 'N/A',
    categories,
    strengths: strengths ?? [],
    improvements: improvements ?? [],
  };
}

async function scoreCandidateCV(
  pdfBuffer,
  fileName,
  targetPosition = 'Vị trí ứng tuyển chung',
  jobContext,
  userId,
) {
  // 1. Check for existing score if userId and jobId are present
  if (userId && jobContext) {
    const existing = await findExistingScore(
      userId,
      jobContext._id.toString(),
      fileName,
    );
    if (existing) {
      logger.log('Tái sử dụng điểm số có sẵn cho ứng viên', {
        action: 'reuse_candidate_score',
        userId,
        jobTitle: jobContext.title,
      });
      return {
        ...existing.analysis,
        id: existing._id,
        reused: true,
      };
    }
  }

  const cvText = await parsePdf(pdfBuffer);

  if (geminiApiKey) {
    const detectedRole = detectRole(cvText, jobContext, targetPosition);
    const topKeywords = getTopKeywords(detectedRole);
    const industryWeightedPrompt = buildIndustryWeightedPrompt(
      cvText,
      detectedRole,
      jobContext,
    );

    const prompt = `
Bạn là một Head of Talent Acquisition với 10 năm kinh nghiệm tuyển dụng IT. Hãy phân tích CV của ứng viên một cách cực kỳ chi tiết, khách quan và chuyên sâu dưới góc độ TRI THỨC chuyên ngành.

---
### BỐI CẢNH & THÔNG TIN TUYỂN DỤNG:
- Vị trí ứng tuyển: ${jobContext ? jobContext.title : targetPosition}
${jobContext ? `- Mô tả công việc (JD): ${jobContext.description}` : ''}
${jobContext && jobContext.requirements && jobContext.requirements.length > 0 ? `- Yêu cầu công việc:\n  + ${jobContext.requirements.join('\n  + ')}` : ''}
${jobContext && jobContext.tags && jobContext.tags.length > 0 ? `- Từ khóa cốt lõi của JD: ${jobContext.tags.join(', ')}` : ''}

---
### NGUYÊN TẮC SUY LUẬN TRI THỨC (BẮT BUỘC):
1. **Kiểm tra tính hợp lệ của CV (Spam Check)**: Trước tiên, kiểm tra xem văn bản dưới đây có THỰC SỰ là một bản Sơ yếu lý lịch (CV/Resume) hay không. Nếu văn bản là rác, bài báo, tài liệu linh tinh, hãy trả về JSON với "isValidCv": false và nêu rõ lý do tại "spamReason".
2. **Kỹ năng thực dùng vs. Chỉ liệt kê**: 
   - Kỹ năng CÓ DÙNG THẬT: xuất hiện trực tiếp trong phần mô tả công việc, dự án cụ thể, có vai trò, đóng góp hoặc kết quả rõ ràng.
   - Kỹ năng CHỈ LIỆT KÊ: Chỉ ghi ở phần "Kỹ năng/Skills" mà không được nhắc đến hay chứng minh trong bất kỳ dự án hoặc kinh nghiệm thực tế nào.
   - Hãy phân tích và phân loại rõ ràng trong trường "skill_analysis".
3. **Suy ra LEVEL thực tế (Intern / Fresher / Junior / Middle / Senior / Lead)**: 
   - Đánh giá dựa trên độ phức tạp của công việc đã làm, kiến trúc hệ thống, mức độ tự chủ trong công việc và các quyết định kỹ thuật đã đưa ra, CHỨ KHÔNG DỰA VÀO số năm kinh nghiệm ghi trong CV.
   - Nêu rõ lý do suy ra level này trong phần "level_assessment_reason".
4. **Nhận xét chất lượng dự án (Project Quality)**: Đánh giá quy mô dự án (lượng user, traffic, database size, complexity), công nghệ sử dụng, vai trò của ứng viên (lead, key member, support) và các đóng góp có rõ ràng, đo lường được bằng số liệu không.
5. **Đề xuất 3 vị trí phù hợp nhất**: Đề xuất 3 vị trí IT (job positions) phù hợp nhất với năng lực hiện tại của ứng viên.

---
### TIÊU CHÍ ĐÁNH GIÁ ƯU TIÊN VỊ TRÍ ${detectedRole.toUpperCase()}:
Với vị trí này, các kỹ năng cốt lõi cần đánh giá ưu tiên là: ${topKeywords.join(', ')}. Hãy chú trọng đánh giá mức độ thành thạo thực sự của ứng viên với các kỹ năng này.
${industryWeightedPrompt}

---
### NỘI DUNG VĂN BẢN CV CỦA ỨNG VIÊN:
${cvText}

---
### YÊU CẦU OUTPUT:
Hãy phân tích và trả về kết quả dưới dạng JSON duy nhất, khớp chính xác cấu trúc sau. Nhận xét và phản hồi phải bằng tiếng Việt.

{
  "isValidCv": true,
  "spamReason": "",
  "overall": (số từ 1-100 đại diện cho điểm tổng quan phù hợp với JD hoặc vị trí ứng tuyển),
  "grade": "A/B/C/D",
  "gradeLabel": "Tốt/Khá/Trung bình/Yếu",
  "level_assessment": "Intern / Fresher / Junior / Middle / Senior / Lead",
  "level_assessment_reason": "Lý do xác định level dựa trên độ phức tạp công việc đã làm",
  "recommended_roles": ["Vị trí phù hợp nhất 1", "Vị trí phù hợp nhất 2", "Vị trí phù hợp nhất 3"],
  "project_quality": "Nhận xét chất lượng dự án: quy mô, công nghệ, vai trò đóng góp có rõ ràng không",
  "skill_analysis": {
    "used_in_projects": ["kỹ năng/công nghệ có dùng thực sự trong dự án/mô tả công việc"],
    "listed_only": ["kỹ năng/công nghệ chỉ liệt kê ở phần kỹ năng mà không thấy dùng trong dự án"]
  },
  "strengths": ["điểm mạnh thực tế 1", "điểm mạnh thực tế 2"],
  "improvements": ["điểm cần cải thiện/học thêm 1", "điểm cần cải thiện/học thêm 2"],
  "review": "Bản nhận xét tổng quan ngắn gọn về CV (tiếng Việt, từ 3-5 câu)",
  "categories": [
    {
      "key": "skills_match",
      "label": "Kỹ năng phù hợp",
      "score": (số từ 0-100),
      "feedback": "Phản hồi chi tiết về sự phù hợp kỹ năng",
      "suggestions": ["Gợi ý cải thiện kỹ năng 1", "Gợi ý 2"]
    },
    {
      "key": "experience",
      "label": "Kinh nghiệm làm việc",
      "score": (số từ 0-100),
      "feedback": "Phản hồi chi tiết về kinh nghiệm và độ phức tạp công việc đã làm",
      "suggestions": ["Gợi ý cải thiện kinh nghiệm 1", "Gợi ý 2"]
    },
    {
      "key": "education",
      "label": "Học vấn & Chứng chỉ",
      "score": (số từ 0-100),
      "feedback": "Phản hồi chi tiết về học vấn, ngành học và chứng chỉ chuyên môn",
      "suggestions": ["Gợi ý học tập/lấy chứng chỉ 1"]
    },
    {
      "key": "format",
      "label": "Định dạng & Trình bày",
      "score": (số từ 0-100),
      "feedback": "Phản hồi chi tiết về bố cục, ngữ pháp, độ dài CV",
      "suggestions": ["Gợi ý trình bày 1"]
    },
    {
      "key": "keywords",
      "label": "Từ khóa & ATS",
      "score": (số từ 0-100),
      "feedback": "Phản hồi về mức độ bao phủ từ khóa so với vị trí/JD",
      "suggestions": ["Gợi ý bổ sung từ khóa cốt lõi 1"]
    }
  ]
}
`;
    const responseText = await callGemini(prompt);
    if (responseText) {
      try {
        const cleaned = responseText
          .replace(/^```json\s*/i, '')
          .replace(/\s*```$/i, '');
        const parsed = JSON.parse(cleaned);

        if (parsed.isValidCv === false) {
          throw new Error(
            `SPAM_CV:${parsed.spamReason || 'Tài liệu tải lên không giống một bản CV hợp lệ. Vui lòng kiểm tra lại.'}`,
          );
        }

        const finalResult = {
          id: 'cv_score_' + Date.now(),
          fileName,
          scoredAt: new Date().toISOString(),
          ...parsed,
        };
        if (userId) {
          const savedScore = await saveScore(
            userId,
            finalResult,
            jobContext ? 'candidate_self_score' : 'general_analysis',
            jobContext ? jobContext._id.toString() : undefined,
            fileName,
            pdfBuffer,
          );
          finalResult.id = savedScore._id.toString();
        }
        return finalResult;
      } catch (parseError) {
        if (parseError.message && parseError.message.startsWith('SPAM_CV:')) {
          throw new Error(parseError.message.replace('SPAM_CV:', ''));
        }
        logger.fail('Parse Gemini response thất bại (candidate)', {
          action: 'score_candidate_cv',
          error: parseError.message,
        });
      }
    }
  }

  // Fallback: Local Knowledge Base Analysis if AI fails
  const fallbackResult = evaluateCandidateLocalScore(
    cvText,
    targetPosition,
    fileName,
    jobContext,
  );
  const enrichedFallback = {
    ...fallbackResult,
    level_assessment: 'Junior',
    level_assessment_reason: 'Đánh giá tự động qua fallback cục bộ',
    recommended_roles: [targetPosition || 'Developer'],
    project_quality: 'Không thể phân tích sâu bằng local fallback',
    skill_analysis: {
      used_in_projects: [],
      listed_only: [],
    },
  };

  if (userId) {
    const savedScore = await saveScore(
      userId,
      enrichedFallback,
      jobContext ? 'candidate_self_score' : 'general_analysis',
      jobContext ? jobContext._id.toString() : undefined,
      fileName,
      pdfBuffer,
    );
    fallbackResult.id = savedScore._id.toString();
  }
  return fallbackResult;
}

async function getCandidatePdfBuffer(jobId, candidateId) {
  try {
    const app = await prisma.application.findFirst({
      where: { jobId: String(jobId), candidateId: String(candidateId) },
    });

    if (app) {
      // 0. Check the Application's own pdfBuffer first (for CVs uploaded during apply without AI scoring)
      if (app.pdfBuffer) return app.pdfBuffer;

      // 1. Try finding the CvScore whose id equals app.cvId
      try {
        const score = app.cvId
          ? await prisma.cvScore.findUnique({ where: { id: String(app.cvId) } })
          : null;
        if (score && score.pdfBuffer) return score.pdfBuffer;
      } catch {}

      // 2. Try by cvUrl string matching app.cvId
      const scoreByUrl = await prisma.cvScore.findFirst({
        where: { cvUrl: app.cvId },
        orderBy: { createdAt: 'desc' },
      });
      if (scoreByUrl && scoreByUrl.pdfBuffer) return scoreByUrl.pdfBuffer;

      // 3. Try latest general score of this user
      const latestScore = await prisma.cvScore.findFirst({
        where: { userId: String(candidateId) },
        orderBy: { createdAt: 'desc' },
      });
      if (latestScore && latestScore.pdfBuffer) return latestScore.pdfBuffer;
    }
    return null;
  } catch {
    return null;
  }
}

async function checkCvAccessPermission(score, user) {
  if (!user) return false;
  const userId = String(user._id || user.id || '');
  const userRole = user.role;

  // 1. Admin has absolute access
  if (userRole === 'admin') {
    return true;
  }

  // 2. Candidate who owns this CV has access
  if (score.userId && String(score.userId) === userId) {
    return true;
  }

  // 3. Employer has access ONLY if the candidate applied to one of their jobs with this CV
  if (userRole === 'employer') {
    // Find all applications submitted by this CV's owner
    // where the CV matches this score's ID or URL
    // (a `userId` of null leaves the filter off, exactly like Mongoose
    //  dropping an `undefined` key from the query object)
    const applications = await prisma.application.findMany({
      where: {
        candidateId: score.userId ? String(score.userId) : undefined,
        OR: [
          { aiScoreId: String(score._id) },
          { cvId: score.cvUrl },
          { cvId: String(score._id) },
        ],
      },
    });

    // `.populate('jobId')`
    const withJobs = await populateRef(applications, {
      refField: 'jobId',
      fetchByIds: (ids) => prisma.job.findMany({ where: { id: { in: ids } } }),
    });

    for (const app of withJobs) {
      const job = app.jobId;
      // Check if the job was posted by this employer
      if (job && job.employerId && String(job.employerId) === userId) {
        return true; // Relationship match found! Access allowed.
      }
    }
  }

  return false;
}

async function getHistory(userId) {
  // Chỉ trả về các bản ghi do chính ứng viên tạo ra (tự phân tích CV).
  // Loại bỏ 'employer_match' vì đây là điểm nhà tuyển dụng chấm, không phải phân tích của ứng viên.
  const rows = await prisma.cvScore.findMany({
    where: {
      userId: String(userId),
      type: { in: ['candidate_self_score', 'general_analysis'] },
    },
    orderBy: { createdAt: 'desc' },
  });

  // `.populate('jobId', 'title companyName')` — Mongoose also kept `_id`.
  return populateRef(rows, {
    refField: 'jobId',
    fetchByIds: (ids) =>
      prisma.job.findMany({
        where: { id: { in: ids } },
        select: { id: true, title: true, companyName: true },
      }),
  });
}

async function getScoreById(id) {
  const row = await prisma.cvScore.findUnique({ where: { id: String(id) } });
  return toDoc(row);
}

async function deleteScoreById(id) {
  let result = null;
  try {
    result = await prisma.cvScore.delete({ where: { id: String(id) } });
  } catch (err) {
    if (err.code !== 'P2025') throw err; // only swallow "record not found"
  }
  if (result) {
    logger.success('Xóa điểm số CV', {
      action: 'delete_score',
      scoreId: id,
    });
  } else {
    logger.fail('Xóa điểm số CV thất bại - không tìm thấy', {
      action: 'delete_score',
      scoreId: id,
    });
  }
  return !!result;
}

module.exports = {
  getAiSettings,
  checkDailyScoreLimit,
  findScoreById,
  findScoreByCvUrl,
  parsePdf,
  findExistingScore,
  saveScore,
  buildIndustryWeightedPrompt,
  scoreCV,
  generateEmployerContext,
  scoreCandidateCV,
  getCandidatePdfBuffer,
  checkCvAccessPermission,
  getHistory,
  getScoreById,
  deleteScoreById,
};
