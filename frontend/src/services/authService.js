import api from "./api";

// ─── Auth Service ─────────────────────────────────────────────────────────────
export const authService = {
  /**
   * Đăng nhập người dùng.
   * Được gọi từ: CandidateLoginPage, EmployerLoginPage, AdminLoginPage.
   * Trả về: { token: string, user: object } — token JWT và thông tin user.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ token: string, user: object }>}
   */
  async login(email, password) {
    return api.post("/auth/login", { email, password });
  },

  /**
   * Đăng ký tài khoản mới.
   * Được gọi từ: CandidateRegisterPage, EmployerRegisterPage.
   * Trả về: { token: string, user: object } — token JWT và thông tin user vừa tạo.
   * @param {{ name, email, password, phone? }} data
   * @returns {Promise<{ token: string, user: object }>}
   */
  async register(data) {
    return api.post("/auth/register", data);
  },

  /**
   * Lấy thông tin profile của user hiện tại qua token.
   * Được gọi từ: AuthContext (khôi phục session khi mount).
   * Trả về: { user: object } — thông tin cá nhân của người dùng.
   * @param {string} token
   * @returns {Promise<{ user: object }>}
   */
  async getProfile(token) {
    return api.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /**
   * Cập nhật thông tin profile.
   * Được gọi từ: CandidateProfilePage, EmployerProfilePage.
   * Trả về: { user: object } — thông tin user đã được cập nhật.
   * @param {object} data
   * @returns {Promise<{ user: object }>}
   */
  async updateProfile(data) {
    return api.patch("/auth/me", data);
  },

  /**
   * Đổi mật khẩu.
   * Được gọi từ: Profile/Settings page (UserSettings).
   * Trả về: { message: string } — thông báo đổi thành công.
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise<{ message: string }>}
   */
  async changePassword(currentPassword, newPassword) {
    return api.post("/auth/change-password", { currentPassword, newPassword });
  },

  /**
   * Quên mật khẩu — gửi yêu cầu reset về email.
   * Được gọi từ: ForgotPasswordPage.
   * Trả về: { message: string } — thông báo đã gửi email reset.
   * @param {string} email
   * @returns {Promise<{ message: string }>}
   */
  async forgotPassword(email) {
    return api.post("/auth/forgot-password", { email });
  },

  /**
   * Đặt lại mật khẩu với token nhận qua email.
   * Được gọi từ: ResetPasswordPage.
   * Trả về: { message: string } — thông báo đặt lại thành công.
   * @param {string} token
   * @param {string} password
   * @returns {Promise<{ message: string }>}
   */
  async resetPassword(token, password) {
    return api.post("/auth/reset-password", { token, password });
  },

  /**
   * Đăng xuất (gọi invalidate token côté server nếu có).
   * Được gọi từ: AuthContext.logout, các nút Đăng xuất trên Header/Profile.
   * Trả về: void — luôn resolve ngay cả khi API lỗi (lỗi bị nuốt intentional).
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore — luôn cho phép logout cục bộ ngay cả khi server lỗi */
    }
  },
};
