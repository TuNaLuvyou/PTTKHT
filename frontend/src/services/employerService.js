import api from "./api";

// ─── Employer Service ──────────────────────────────────────────────────────────
export const employerService = {
  /**
   * Lấy thống kê dashboard cho nhà tuyển dụng.
   * Được gọi từ: EmployerDashboard.
   * Trả về: object — thống kê tổng số việc làm, ứng viên, đơn ứng tuyển, ...
   * @returns {Promise<object>}
   */
  async getDashboardStats() {
    return api.get("/employer/dashboard/stats");
  },

  /**
   * Lấy danh sách việc làm do chính nhà tuyển dụng đăng.
   * Được gọi từ: EmployerJobsPage.
   * Trả về: object[] — danh sách công việc của nhà tuyển dụng.
   * @param {object} params - tham số lọc/phân trang (page, limit, ...)
   * @returns {Promise<object[]>}
   */
  async getMyJobs(params = {}) {
    return api.get("/employer/jobs", { params });
  },

  /**
   * Lấy chi tiết một công việc theo ID (của nhà tuyển dụng).
   * Được gọi từ: EmployerJobFormPage (chỉnh sửa), trang chi tiết việc làm.
   * Trả về: object — chi tiết công việc.
   * @param {string|number} id
   * @returns {Promise<object>}
   */
  async getJob(id) {
    return api.get(`/employer/jobs/${id}`);
  },

  /**
   * Chuyển đổi định dạng job từ frontend sang backend (gửi lên API).
   * Helper nội bộ, dùng trong createJob / updateJob.
   * @param {object} data - dữ liệu job từ form frontend
   * @returns {object}
   */
  toBackendFormat(data) {
    return {
      title: data.title,
      description: data.description,
      location: data.location,
      type: data.job_type,
      level: data.level,
      companyName: data.companyName,
      category: data.category || 'Công nghệ thông tin',
      salaryMin: data.salary_min ? Number(data.salary_min) : undefined,
      salaryMax: data.salary_max ? Number(data.salary_max) : undefined,
      tags: data.required_skills || [],
      requirements: data.requirements ? data.requirements.split('\\n').filter(Boolean) : [],
      benefits: data.benefits ? data.benefits.split('\\n').filter(Boolean) : [],
      deadline: data.expired_at || undefined,
      status: data.status || 'draft',
    };
  },

  /**
   * Chuyển đổi định dạng job từ backend về frontend (hiển thị UI).
   * Helper nội bộ, dùng khi nhận dữ liệu từ API.
   * @param {object} job - dữ liệu job từ backend
   * @returns {object}
   */
  toFrontendFormat(job) {
    return {
      id: job._id || job.id,
      title: job.title,
      description: job.description,
      location: job.location,
      companyName: job.companyName,
      category: job.category,
      job_type: (job.type || 'full-time').toLowerCase(),
      level: (job.level || 'junior').toLowerCase(),
      salary_min: job.salaryMin || 0,
      salary_max: job.salaryMax || 0,
      required_skills: job.tags || [],
      requirements: Array.isArray(job.requirements) ? job.requirements.join('\\n') : (job.requirements || ''),
      benefits: Array.isArray(job.benefits) ? job.benefits.join('\\n') : (job.benefits || ''),
      status: job.status || 'active',
      expired_at: job.deadline ? new Date(job.deadline).toISOString() : '',
      view_count: job.views || 0,
      application_count: job.applied || 0,
      created_at: job.createdAt || job.created_at,
      updated_at: job.updatedAt || job.updated_at,
    };
  },

  /**
   * Tạo tin tuyển dụng mới.
   * Được gọi từ: EmployerJobFormPage (nút Tạo/Draft).
   * Trả về: object — công việc vừa tạo (có _id).
   * @param {object} data
   * @returns {Promise<object>}
   */
  async createJob(data) {
    return api.post("/jobs", this.toBackendFormat(data));
  },

  /**
   * Cập nhật thông tin tin tuyển dụng.
   * Được gọi từ: EmployerJobFormPage (chỉnh sửa existing job).
   * Trả về: object — công việc đã cập nhật.
   * @param {string|number} id
   * @param {object} data
   * @returns {Promise<object>}
   */
  async updateJob(id, data) {
    return api.patch(`/jobs/${id}`, this.toBackendFormat(data));
  },

  /**
   * Xóa một tin tuyển dụng.
   * Được gọi từ: EmployerJobsPage (nút Xóa).
   * Trả về: { message: string } — thông báo xóa thành công.
   * @param {string|number} id
   * @returns {Promise<{ message: string }>}
   */
  async deleteJob(id) {
    return api.delete(`/jobs/${id}`);
  },

  /**
   * Cập nhật trạng thái duyệt/tin tuyển dụng (active, pending, rejected, ...).
   * Được gọi từ: AdminJobsPage (quản trị viên duyệt tin).
   * Trả về: object — công việc sau khi cập nhật trạng thái.
   * @param {string|number} id
   * @param {string} status
   * @returns {Promise<object>}
   */
  async updateJobStatus(id, status) {
    return this.updateJob(id, { status });
  },

  // ── Applications ──
  /**
   * Lấy danh sách đơn ứng tuyển của một công việc.
   * Được gọi từ: EmployerApplicantsPage.
   * Trả về: object[] — danh sách ứng viên đã ứng tuyển vào công việc này.
   * @param {string|number} jobId
   * @param {object} params
   * @returns {Promise<object[]>}
   */
  async getApplications(jobId, params = {}) {
    return api.get(`/employer/jobs/${jobId}/applications`, { params });
  },

  /**
   * Cập nhật trạng thái đơn ứng tuyển (pending, reviewing, interview, offered, rejected).
   * Được gọi từ: EmployerApplicantsPage (nút thay đổi trạng thái).
   * Trả về: object — đơn ứng tuyển sau khi cập nhật.
   * @param {string|number} applicationId
   * @param {string} status
   * @returns {Promise<object>}
   */
  async updateApplicationStatus(applicationId, status) {
    return api.patch(`/employer/applications/${applicationId}/status`, {
      status,
    });
  },

  // ── CV Scoring ──
  /**
   * Gửi CV để chấm điểm AI cho một ứng viên theo công việc.
   * Được gọi từ: EmployerApplicantsPage / ScoringModal (nút Chấm điểm).
   * Trả về: object — kết quả chấm điểm CV (overall, grade, categories, ...).
   * @param {string|number} jobId
   * @param {File} file - file CV (PDF/DOCX)
   * @param {string|number} candidateId - ID ứng viên
   * @returns {Promise<object>}
   */
  async scoreCv(jobId, file, candidateId) {
    const formData = new FormData();
    if (file) {
      formData.append('cv', file);
    }
    if (candidateId) {
      formData.append('candidateId', candidateId);
    }

    const response = await api.post(`/cv-scoring/score/${jobId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /**
   * Xóa một đơn ứng tuyển.
   * Được gọi từ: EmployerApplicantsPage (nút Xóa đơn).
   * Trả về: { message: string } — thông báo xóa thành công.
   * @param {string|number} applicationId
   * @returns {Promise<{ message: string }>}
   */
  async deleteApplication(applicationId) {
    return api.delete(`/employer/applications/${applicationId}`);
  },

  /**
   * Xóa nhiều đơn ứng tuyển cùng lúc (bulk delete).
   * Được gọi từ: EmployerApplicantsPage (nút Xóa nhiều).
   * Trả về: { message: string, count: number } — số lượng đã xóa.
   * @param {string[]|number[]} ids - danh sách ID đơn ứng tuyển
   * @returns {Promise<object>}
   */
  async bulkDeleteApplications(ids) {
    return api.post('/employer/applications/bulk-delete', { ids });
  },

  // ── Candidate Profile ──
  /**
   * Lấy hồ sơ chi tiết của một ứng viên (dành cho nhà tuyển dụng xem).
   * Được gọi từ: pages/Employer/CandidateProfilePage.jsx.
   * Trả về: object — hồ sơ ứng viên (thông tin cá nhân, CV, kỹ năng, ...).
   * @param {string|number} candidateId
   * @returns {Promise<object>}
   */
  async getCandidateProfile(candidateId) {
    return api.get(`/employer/candidates/${candidateId}/profile`);
  },
};
