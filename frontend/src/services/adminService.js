import api from './api'

// ─── Admin Service ─────────────────────────────────────────────────────────────
export const adminService = {
  /**
   * Đăng nhập cho quản trị viên.
   * Được gọi từ: AdminLoginPage.
   * Trả về: { token: string, user: object } — token JWT và thông tin admin.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ token: string, user: object }>}
   */
  async login(email, password) {
    return api.post('/auth/login', { email, password })
  },

  /**
   * Lấy thống kê tổng quan dashboard admin.
   * Được gọi từ: AdminDashboardPage.
   * Trả về: object — thống kê user, job, application, cv-score, ...
   * @returns {Promise<object>}
   */
  async getDashboard() {
    return api.get('/admin/dashboard')
  },

  // ── Users ──────────────────────────────────────────────────────────────────
  /**
   * Lấy danh sách người dùng (có lọc theo role, status, phân trang).
   * Được gọi từ: AdminUsersPage.
   * Trả về: { data: User[], total: number } — danh sách user và tổng số.
   * @param {object} params - { role?, status?, page?, limit?, keyword? }
   * @returns {Promise<{ data: object[], total: number }>}
   */
  async getUsers(params = {}) {
    return api.get(`/admin/users?${new URLSearchParams(params)}`)
  },

  /**
   * Lấy chi tiết một người dùng theo ID.
   * Được gọi từ: AdminUsersPage (xem chi tiết user).
   * Trả về: object — thông tin chi tiết user.
   * @param {string|number} id
   * @returns {Promise<object>}
   */
  async getUser(id) {
    return api.get(`/admin/users/${id}`)
  },

  /**
   * Cập nhật trạng thái tài khoản user (active, banned, ...).
   * Được gọi từ: AdminUsersPage (nút Khóa/Mở khóa).
   * Trả về: object — user đã được cập nhật trạng thái.
   * @param {string|number} id
   * @param {string} status
   * @param {string} reason - lý do thay đổi trạng thái
   * @returns {Promise<object>}
   */
  async updateUserStatus(id, status, reason = '') {
    return api.patch(`/admin/users/${id}/status`, { status, reason })
  },

  /**
   * Xóa một người dùng khỏi hệ thống.
   * Được gọi từ: AdminUsersPage (nút Xóa user).
   * Trả về: { message: string } — thông báo xóa thành công.
   * @param {string|number} id
   * @returns {Promise<{ message: string }>}
   */
  async deleteUser(id) {
    return api.delete(`/admin/users/${id}`)
  },

  // ── Jobs ───────────────────────────────────────────────────────────────────
  /**
   * Lấy danh sách tất cả công việc (quản trị viên xem tất cả, bao gồm chờ duyệt).
   * Được gọi từ: AdminJobsPage.
   * Trả về: { data: Job[], total: number } — danh sách công việc và tổng số.
   * @param {object} params - { status?, page?, limit?, keyword? }
   * @returns {Promise<{ data: object[], total: number }>}
   */
  async getJobs(params = {}) {
    return api.get(`/admin/jobs?${new URLSearchParams(params)}`)
  },

  /**
   * Cập nhật trạng thái duyệt tin tuyển dụng (active, pending, rejected).
   * Được gọi từ: AdminJobsPage (nút Duyệt/Từ chối).
   * Trả về: object — công việc sau khi cập nhật trạng thái.
   * @param {string|number} id
   * @param {string} status
   * @returns {Promise<object>}
   */
  async updateJobStatus(id, status) {
    return api.patch(`/admin/jobs/${id}/status`, { status })
  },

  /**
   * Bật/tắt đánh giá nổi bật (featured) cho một công việc.
   * Được gọi từ: AdminJobsPage (nút Nổi bật).
   * Trả về: object — công việc sau khi thay đổi featured.
   * @param {string|number} id
   * @param {boolean} featured
   * @returns {Promise<object>}
   */
  async toggleJobFeatured(id, featured) {
    return api.patch(`/admin/jobs/${id}/featured`, { featured })
  },

  /**
   * Xóa một tin tuyển dụng khỏi hệ thống (admin).
   * Được gọi từ: AdminJobsPage (nút Xóa).
   * Trả về: { message: string } — thông báo xóa thành công.
   * @param {string|number} id
   * @returns {Promise<{ message: string }>}
   */
  async deleteJob(id) {
    return api.delete(`/admin/jobs/${id}`)
  },

  // ── CV Scores ──────────────────────────────────────────────────────────────
  /**
   * Lấy danh sách kết quả chấm điểm CV (admin xem tất cả).
   * Được gọi từ: AdminCVScoresPage.
   * Trả về: { data: CVScore[], total: number } — danh sách điểm CV và tổng số.
   * @param {object} params - { page?, limit?, keyword?, grade? }
   * @returns {Promise<{ data: object[], total: number }>}
   */
  async getCVScores(params = {}) {
    return api.get(`/admin/cv-scores?${new URLSearchParams(params)}`)
  },

  /**
   * Xóa một kết quả chấm điểm CV.
   * Được gọi từ: AdminCVScoresPage (nút Xóa).
   * Trả về: { message: string } — thông báo xóa thành công.
   * @param {string|number} id
   * @returns {Promise<{ message: string }>}
   */
  async deleteCVScore(id) {
    return api.delete(`/admin/cv-scores/${id}`)
  },

  // ── Reports ────────────────────────────────────────────────────────────────
  /**
   * Lấy báo cáo thống kê (biểu đồ, phân phối điểm, ...).
   * Được gọi từ: AdminReportsPage.
   * Trả về: object — dữ liệu báo cáo.
   * @returns {Promise<object>}
   */
  async getReports() {
    return api.get('/admin/reports')
  },

  // ── Settings ───────────────────────────────────────────────────────────────
  /**
   * Lấy cài đặt hệ thống (site, ai, jobs, users, security).
   * Được gọi từ: AdminSettingsPage.
   * Trả về: object — object chứa các section cài đặt.
   * @returns {Promise<object>}
   */
  async getSettings() {
    return api.get('/admin/settings')
  },

  /**
   * Cập nhật một section cài hệ thống (ví dụ: site, ai, jobs).
   * Được gọi từ: AdminSettingsPage (nút Lưu).
   * Trả về: object — cài đặt sau khi cập nhật.
   * @param {string} section - tên section ('site', 'ai', 'jobs', 'users', 'security')
   * @param {object} data - dữ liệu cài đặt mới
   * @returns {Promise<object>}
   */
  async updateSettings(section, data) {
    return api.patch(`/admin/settings/${section}`, data)
  },

  // ── Notifications ──────────────────────────────────────────────────────────
  /**
   * Lấy danh sách thông báo (có thể lọc theo filter=unread).
   * Được gọi từ: AdminNotificationsPage.
   * Trả về: { data: Notification[], total: number, unreadCount: number }.
   * @param {object} params - { filter?, page?, limit? }
   * @returns {Promise<object>}
   */
  async getNotifications(params = {}) {
    const query = params.filter ? `?filter=${params.filter}` : ''
    return api.get(`/admin/notifications${query}`)
  },

  /**
   * Đánh dấu một thông báo là đã đọc.
   * Được gọi từ: AdminNotificationsPage (nút Đã đọc).
   * Trả về: { success: boolean }.
   * @param {string|number} id
   * @returns {Promise<{ success: boolean }>}
   */
  async markNotificationRead(id) {
    return api.patch(`/admin/notifications/${id}/read`)
  },

  /**
   * Xóa một thông báo.
   * Được gọi từ: AdminNotificationsPage (nút Xóa).
   * Trả về: { success: boolean }.
   * @param {string|number} id
   * @returns {Promise<{ success: boolean }>}
   */
  async deleteNotification(id) {
    return api.delete(`/admin/notifications/${id}`)
  },

  /**
   * Đánh dấu tất cả thông báo là đã đọc.
   * Được gọi từ: AdminNotificationsPage (nút Đánh dấu tất cả đã đọc).
   * Trả về: { success: boolean, count: number }.
   * @returns {Promise<{ success: boolean, count: number }>}
   */
  async markAllNotificationsRead() {
    return api.post('/admin/notifications/read-all')
  },
}
