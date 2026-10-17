// CvScoringController — plain-JS port of
// backend/src/cv-scoring/cv-scoring.controller.ts
//
// Route protection (verifyToken) is applied in routes/cvScoring.routes.js.
// Status codes match NestJS: POST -> 201, GET/DELETE -> 200.

const cvScoringService = require('../services/cvScoring.service');
const jobsService = require('../services/job.service');
const { HttpError } = require('../utils/httpError');

// ─── Validation helpers ───────────────────────────────────────────────

async function validateAiEnabled() {
  const settings = await cvScoringService.getAiSettings();
  if (!settings.cvScoreEnabled) {
    throw HttpError.badRequest(
      'Tính năng chấm điểm CV hiện đang bị tắt trong cài đặt hệ thống.',
    );
  }
  return settings;
}

function validateFile(file, settings) {
  const maxBytes = settings.maxFileSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw HttpError.badRequest(
      `Dung lượng file vượt quá giới hạn ${settings.maxFileSizeMB}MB.`,
    );
  }
  const ext = file.originalname.split('.').pop()?.toLowerCase();
  if (!ext || !settings.supportedFormats.includes(ext)) {
    throw HttpError.badRequest(
      `Định dạng file không được hỗ trợ. Các định dạng: ${settings.supportedFormats.join(', ')}`,
    );
  }
}

// ─── Handlers ─────────────────────────────────────────────────────────

// GET /api/cv-scoring/view/:id
async function viewCv(req, res, next) {
  try {
    let score = await cvScoringService.findScoreById(req.params.id);
    if (!score || !score.pdfBuffer) {
      score = await cvScoringService.findScoreByCvUrl(req.params.id);
    }

    if (!score || !score.pdfBuffer) {
      throw new HttpError(
        404,
        'Không tìm thấy file CV của ứng viên trong cơ sở dữ liệu.',
      );
    }

    const hasAccess = await cvScoringService.checkCvAccessPermission(
      score,
      req.user,
    );
    if (!hasAccess) {
      throw new HttpError(403, 'Bạn không có quyền truy cập file CV này.');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.send(score.pdfBuffer);
  } catch (err) {
    next(err);
  }
}

// POST /api/cv-scoring/score/:jobId   (multipart/form-data, field `cv`)
async function scoreCv(req, res, next) {
  try {
    const settings = await validateAiEnabled();

    // Check daily score limit for the employer (req.user is the admin/employer doing the scoring)
    // Note: candidateId here is the target candidate being scored, not the requester
    const candidateId = req.body?.candidateId;

    let pdfBuffer;

    if (req.file) {
      validateFile(req.file, settings);
      pdfBuffer = req.file.buffer;
    } else if (candidateId) {
      const dbBuffer = await cvScoringService.getCandidatePdfBuffer(
        req.params.jobId,
        candidateId,
      );
      if (dbBuffer) pdfBuffer = dbBuffer;
    }

    if (!pdfBuffer) {
      throw HttpError.badRequest(
        'Không tìm thấy file CV hiện tại của ứng viên. Vui lòng tải lên file CV (PDF) mới.',
      );
    }

    const job = await jobsService.findOne(req.params.jobId);
    if (!job) {
      throw HttpError.badRequest('Không tìm thấy công việc');
    }

    const result = await cvScoringService.scoreCV(
      pdfBuffer,
      job,
      candidateId,
    );
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/cv-scoring/candidate-score   (multipart/form-data, field `cv`)
async function scoreCandidateCv(req, res, next) {
  try {
    try {
      const settings = await validateAiEnabled();

      if (!req.file) {
        throw HttpError.badRequest('Vui lòng tải lên file CV');
      }
      const file = req.file;

      // Fix Vietnamese font encoding issue caused by multer using latin1 by default
      file.originalname = Buffer.from(file.originalname, 'latin1').toString(
        'utf8',
      );

      validateFile(file, settings);

      // Check daily score limit
      if (req.user) {
        const limit = await cvScoringService.checkDailyScoreLimit(
          req.user._id || req.user.id,
        );
        if (!limit.allowed) {
          throw HttpError.badRequest(
            `Bạn đã đạt giới hạn ${limit.limit} lượt chấm điểm CV trong ngày hôm nay. Vui lòng quay lại vào ngày mai.`,
          );
        }
      }

      const targetPosition = req.body?.target_position;
      const jobId = req.body?.jobId;

      let jobContext;
      if (jobId) {
        const found = await jobsService.findOne(jobId);
        if (found) jobContext = found;
      }

      const userId = req.user?.id || req.user?._id;
      const result = await cvScoringService.scoreCandidateCV(
        file.buffer,
        file.originalname,
        targetPosition,
        jobContext,
        userId,
      );
      res.status(201).json(result);
    } catch (error) {
      throw HttpError.badRequest(error.message || 'Lỗi khi phân tích CV');
    }
  } catch (err) {
    next(err);
  }
}

// GET /api/cv-scoring/history
async function getHistory(req, res, next) {
  try {
    res.json(await cvScoringService.getHistory(req.user._id));
  } catch (err) {
    next(err);
  }
}

// GET /api/cv-scoring/scores/:id
async function getScoreById(req, res, next) {
  try {
    const score = await cvScoringService.getScoreById(req.params.id);
    if (!score) {
      throw new HttpError(404, 'Không tìm thấy kết quả chấm điểm CV');
    }
    res.json(score);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/cv-scoring/scores/:id
async function deleteScoreById(req, res, next) {
  try {
    const deleted = await cvScoringService.deleteScoreById(req.params.id);
    if (!deleted) {
      throw new HttpError(404, 'Không tìm thấy kết quả chấm điểm CV');
    }
    res.json({ message: 'Đã xóa kết quả chấm điểm CV thành công' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  viewCv,
  scoreCv,
  scoreCandidateCv,
  getHistory,
  getScoreById,
  deleteScoreById,
};
