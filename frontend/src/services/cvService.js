import api from './api'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const delay = (ms) => new Promise((r) => setTimeout(r, ms))

// ─── Mock CV Score Response ────────────────────────────────────────────────────
function generateMockScore(fileName) {
  const overall = Math.floor(Math.random() * 30) + 62 // 62–92

  const categories = [
    {
      key: 'skills_match',
      label: 'Kỹ năng phù hợp',
      score: Math.floor(Math.random() * 25) + 65,
      icon: '🎯',
      feedback: 'Các kỹ năng kỹ thuật được trình bày rõ ràng. Nên bổ sung thêm các công nghệ mới như Docker, Kubernetes.',
      suggestions: ['Bổ sung kinh nghiệm với cloud platforms (AWS/GCP)', 'Thêm chứng chỉ kỹ thuật liên quan'],
    },
    {
      key: 'experience',
      label: 'Kinh nghiệm làm việc',
      score: Math.floor(Math.random() * 20) + 70,
      icon: '💼',
      feedback: 'Kinh nghiệm được mô tả tốt nhưng thiếu số liệu cụ thể về kết quả đạt được.',
      suggestions: ['Thêm số liệu định lượng (VD: tăng performance 40%)', 'Mô tả rõ hơn vai trò trong từng dự án'],
    },
    {
      key: 'education',
      label: 'Học vấn & Chứng chỉ',
      score: Math.floor(Math.random() * 20) + 75,
      icon: '🎓',
      feedback: 'Trình độ học vấn phù hợp. Các chứng chỉ bổ sung sẽ tăng giá trị CV.',
      suggestions: ['Cân nhắc lấy chứng chỉ AWS Certified', 'Tham gia các khóa học chuyên sâu trên Coursera'],
    },
    {
      key: 'format',
      label: 'Định dạng & Trình bày',
      score: Math.floor(Math.random() * 20) + 60,
      icon: '📄',
      feedback: 'CV có cấu trúc tốt nhưng một số phần bố cục chưa tối ưu cho ATS scanner.',
      suggestions: ['Sử dụng font chuẩn (Arial, Calibri)', 'Tránh dùng bảng và cột nhiều cho ATS', 'Giữ CV trong 1-2 trang'],
    },
    {
      key: 'keywords',
      label: 'Từ khóa & ATS',
      score: Math.floor(Math.random() * 25) + 55,
      icon: '🔍',
      feedback: 'CV thiếu một số từ khóa quan trọng mà nhà tuyển dụng thường tìm kiếm.',
      suggestions: ['Bổ sung từ khóa từ JD như "microservices", "agile"', 'Sử dụng thuật ngữ ngành phổ biến hơn'],
    },
  ]

  return {
    id: 'cv_score_' + Date.now(),
    fileName,
    overall,
    grade: overall >= 85 ? 'A' : overall >= 70 ? 'B' : overall >= 55 ? 'C' : 'D',
    gradeLabel: overall >= 85 ? 'Tốt' : overall >= 70 ? 'Khá' : overall >= 55 ? 'Trung bình' : 'Yếu',
    level_assessment: overall >= 80 ? 'Senior' : overall >= 65 ? 'Middle' : 'Junior',
    extracted_experience_years: overall >= 80 ? 5.5 : overall >= 65 ? 2.5 : 1.0,
    project_quality: 'Dự án thực tế tốt, có áp dụng công nghệ hiện đại. Cần nêu rõ hơn vai trò cá nhân.',
    skill_analysis: {
      advanced: ['React', 'JavaScript', 'Tailwind CSS', 'Node.js'],
      familiar: ['Docker', 'AWS', 'MongoDB']
    },
    recommended_roles: ['Frontend Developer', 'Fullstack Developer', 'UI Engineer'],
    categories,
    strengths: ['Trình bày cấu trúc mạch lạc', 'Kỹ năng kỹ thuật đa dạng', 'Kinh nghiệm thực tế phù hợp'],
    improvements: ['Cần thêm số liệu cụ thể', 'Bổ sung keywords quan trọng', 'Tối ưu cho ATS scanning'],
    scoredAt: new Date().toISOString(),
  }
}

// ─── CV Service ────────────────────────────────────────────────────────────────
export const cvService = {
  /**
   * Upload file CV và gửi chấm điểm AI.
   * Được gọi từ: CVUploadPage (trang CVScoring / cv-upload).
   * Trả về: CVScoreResult — kết quả chấm điểm (overall, grade, categories, strengths, improvements, ...).
   * @param {File} file - PDF hoặc DOCX
   * @param {{ jobId?, jobTitle?, targetPosition? }} options
   * @param {function} onProgress - callback(percent: number) theo dõi tiến độ upload
   * @returns {Promise<object>}
   */
  async scoreCV(file, options = {}, onProgress) {
    if (USE_MOCK) {
      // Simulate upload progress
      for (let p = 0; p <= 100; p += 20) {
        await delay(300)
        onProgress?.(p)
      }
      await delay(800) // AI processing
      return generateMockScore(file.name)
    }

    const formData = new FormData()
    formData.append('cv', file)
    if (options.jobId) formData.append('jobId', options.jobId)
    if (options.jobTitle) formData.append('jobTitle', options.jobTitle)
    if (options.targetPosition) formData.append('target_position', options.targetPosition)

    // Use XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const token = localStorage.getItem('nexcv_candidate_token') || localStorage.getItem('nexcv_token')
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100))
      })

      xhr.addEventListener('load', () => {
        try {
          const data = JSON.parse(xhr.responseText)
          if (xhr.status >= 200 && xhr.status < 300) resolve(data)
          else reject({ message: data.message || 'Upload thất bại', status: xhr.status })
        } catch {
          reject({ message: 'Phản hồi không hợp lệ' })
        }
      })

      xhr.addEventListener('error', () => reject({ message: 'Lỗi kết nối mạng' }))

      xhr.open('POST', `${BASE_URL}/cv-scoring/candidate-score`)
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.send(formData)
    })
  },

  /**
   * Lấy danh sách CV đã chấm điểm của chính ứng viên.
   * Được gọi từ: CVTab (trong Profile).
   * Trả về: object[] — danh sách kết quả chấm điểm CV (id, fileName, overall, grade, scoredAt).
   * @returns {Promise<object[]>}
   */
  async getMyCVs() {
    if (USE_MOCK) {
      await delay(500)
      return [
        { id: 1, fileName: 'CV_NguyenVanAn_2024.pdf', overall: 78, grade: 'B', scoredAt: '2025-01-20T10:30:00Z' },
        { id: 2, fileName: 'CV_Frontend_Updated.pdf', overall: 85, grade: 'A', scoredAt: '2025-01-15T14:20:00Z' },
      ]
    }
    const res = await api.get('/cv-scoring/history')
    return res.data?.data || res.data || res
  },

  /**
   * Lấy chi tiết một kết quả chấm điểm CV theo ID.
   * Được gọi từ: CVTab / trang chi tiết điểm số CV.
   * Trả về: object — chi tiết kết quả chấm điểm (analysis, categories, strengths, improvements).
   * @param {string|number} id
   * @returns {Promise<object>}
   */
  async getCVScore(id) {
    if (USE_MOCK) {
      await delay(400)
      return generateMockScore('CV_NguyenVanAn_2024.pdf')
    }
    return api.get(`/cv-scoring/scores/${id}`)
  },

  /**
   * Xóa một kết quả chấm điểm CV khỏi lịch sử.
   * Được gọi từ: CVTab (nút Xóa trên mỗi mục lịch sử).
   * Trả về: { message: string } — thông báo xóa thành công.
   * @param {string|number} id
   * @returns {Promise<{ message: string }>}
   */
  async deleteCVScore(id) {
    if (USE_MOCK) {
      await delay(300)
      return { message: 'Đã xóa' }
    }
    return api.delete(`/cv-scoring/scores/${id}`)
  },

  /**
   * Lấy lịch sử chấm điểm CV của ứng viên (alias của getMyCVs).
   * Được gọi từ: CVTab, AdminCVScoresPage.
   * Trả về: object[] — danh sách lịch sử chấm điểm.
   * @returns {Promise<object[]>}
   */
  async getScoreHistory() {
    if (USE_MOCK) {
      await delay(500)
      return [generateMockScore('My_Resume_v2.pdf'), generateMockScore('Backend_Dev_CV.docx')]
    }
    const res = await api.get('/cv-scoring/history')
    // Ensure we handle both {data: [...]} and direct array responses
    return res.data?.data || res.data || res
  },

  /**
   * Lưu dữ liệu resume (Reactive Resume) lên server.
   * Được gọi từ: CVBuilderPage (nút Lưu).
   * Trả về: { id, ...data } — đối tượng resume đã lưu kèm ID.
   * @param {object} data
   * @returns {Promise<object>}
   */
  async saveResume(data) {
    if (USE_MOCK) {
      await delay(500)
      return { id: data.id || Date.now(), ...data }
    }
    return data.id
      ? api.put(`/resumes/${data.id}`, data)
      : api.post('/resumes', data)
  },

  /**
   * Lấy chi tiết một resume theo ID.
   * Được gọi từ: CVBuilderPage (mở resume cũ chỉnh sửa).
   * Trả về: object — nội dung resume (title, content, ...).
   * @param {string|number} id
   * @returns {Promise<object>}
   */
  async getResume(id) {
    if (USE_MOCK) {
      await delay(400)
      return { id, title: 'CV mẫu', content: {} }
    }
    return api.get(`/resumes/${id}`)
  },

  /**
   * Lưu dữ liệu CV Builder (drag-drop editor) lên server.
   * Được gọi từ: CVBuilderPage (tự động lưu nháp).
   * Trả về: { id, ...data } — dữ liệu CV Builder đã lưu.
   * @param {object} data
   * @returns {Promise<object>}
   */
  async saveCVBuilder(data) {
    if (USE_MOCK) {
      await delay(500)
      return { id: data.id || Date.now(), ...data }
    }
    return data.id
      ? api.put(`/resumes/${data.id}`, data)
      : api.post('/resumes', data)
  },

  /**
   * Lấy dữ liệu CV Builder theo ID.
   * Được gọi từ: CVBuilderPage (tải bản nháp đã lưu).
   * Trả về: object — dữ liệu CV Builder (title, content, ...).
   * @param {string|number} id
   * @returns {Promise<object>}
   */
  async getCVBuilder(id) {
    if (USE_MOCK) {
      await delay(400)
      return { id, title: 'CV mẫu', content: {} }
    }
    return api.get(`/resumes/${id}`)
  },
}
