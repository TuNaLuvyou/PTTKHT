/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useLocation } from "react-router-dom";
import { authService } from "../services/authService";

const AuthContext = createContext(null);
AuthContext.displayName = "AuthContext";

/**
 * AuthProvider quản lý xác thực tách biệt theo phân hệ:
 * 1. Ứng viên (Candidate): nexcv_candidate_token
 * 2. Nhà tuyển dụng (Employer): nexcv_employer_token
 * 3. Quản trị viên (Admin): nexcv_admin_token
 *
 * Nhờ tách biệt token, người dùng có thể mở đồng thời Cổng Ứng viên và Cổng Nhà tuyển dụng
 * trên cùng một trình duyệt mà không bị ghi đè ("chồng tài khoản") hay bị ép đăng xuất.
 */
export function AuthProvider({ children }) {
  const location = useLocation();

  // State riêng cho từng phân hệ
  const [candidateUser, setCandidateUser] = useState(null);
  const [candidateToken, setCandidateToken] = useState(() =>
    localStorage.getItem("nexcv_candidate_token")
  );

  const [employerUser, setEmployerUser] = useState(null);
  const [employerToken, setEmployerToken] = useState(() =>
    localStorage.getItem("nexcv_employer_token")
  );

  const [adminUser, setAdminUser] = useState(null);
  const [adminToken, setAdminToken] = useState(() =>
    localStorage.getItem("nexcv_admin_token")
  );

  const [loading, setLoading] = useState(true);

  // Khôi phục session khi mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      let candTok = localStorage.getItem("nexcv_candidate_token");
      let empTok = localStorage.getItem("nexcv_employer_token");
      let admTok = localStorage.getItem("nexcv_admin_token");
      const legacyTok = localStorage.getItem("nexcv_token");

      // Di chuyển dữ liệu cũ từ legacy nexcv_token nếu chưa phân tách
      if (legacyTok && !candTok && !empTok && !admTok) {
        try {
          const profile = await authService.getProfile(legacyTok);
          if (profile.role === "employer" || profile.role === "recruiter") {
            empTok = legacyTok;
            localStorage.setItem("nexcv_employer_token", legacyTok);
            if (isMounted) {
              setEmployerToken(legacyTok);
              setEmployerUser(profile);
            }
          } else if (profile.role === "admin") {
            admTok = legacyTok;
            localStorage.setItem("nexcv_admin_token", legacyTok);
            if (isMounted) {
              setAdminToken(legacyTok);
              setAdminUser(profile);
            }
          } else {
            candTok = legacyTok;
            localStorage.setItem("nexcv_candidate_token", legacyTok);
            if (isMounted) {
              setCandidateToken(legacyTok);
              setCandidateUser(profile);
            }
          }
        } catch {
          localStorage.removeItem("nexcv_token");
        }
      }

      // 1. Phục hồi session Candidate
      if (candTok && isMounted) {
        try {
          const profile = await authService.getProfile(candTok);
          if (isMounted) {
            setCandidateUser(profile);
            setCandidateToken(candTok);
          }
        } catch {
          localStorage.removeItem("nexcv_candidate_token");
          if (isMounted) {
            setCandidateToken(null);
            setCandidateUser(null);
          }
        }
      }

      // 2. Phục hồi session Employer
      if (empTok && isMounted) {
        try {
          const profile = await authService.getProfile(empTok);
          if (isMounted) {
            setEmployerUser(profile);
            setEmployerToken(empTok);
          }
        } catch {
          localStorage.removeItem("nexcv_employer_token");
          if (isMounted) {
            setEmployerToken(null);
            setEmployerUser(null);
          }
        }
      }

      // 3. Phục hồi session Admin
      if (admTok && isMounted) {
        try {
          const profile = await authService.getProfile(admTok);
          if (isMounted) {
            setAdminUser(profile);
            setAdminToken(admTok);
          }
        } catch {
          localStorage.removeItem("nexcv_admin_token");
          if (isMounted) {
            setAdminToken(null);
            setAdminUser(null);
          }
        }
      }

      if (isMounted) setLoading(false);
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Xác định phân hệ hiện tại dựa vào URL pathname
  const currentPath = location.pathname || "";
  const isEmployerPortal = currentPath.startsWith("/employer");
  const isAdminPortal = currentPath.startsWith("/admin");

  // User và Token chủ động phản ánh đúng phân hệ đang hiển thị
  const activeUser = useMemo(() => {
    if (isAdminPortal) return adminUser;
    if (isEmployerPortal) return employerUser;
    return candidateUser;
  }, [isAdminPortal, isEmployerPortal, adminUser, employerUser, candidateUser]);

  const activeToken = useMemo(() => {
    if (isAdminPortal) return adminToken;
    if (isEmployerPortal) return employerToken;
    return candidateToken;
  }, [isAdminPortal, isEmployerPortal, adminToken, employerToken, candidateToken]);

  /**
   * Đăng nhập người dùng và cập nhật đúng phân hệ tương ứng
   * @param {string} email
   * @param {string} password
   * @param {'candidate'|'employer'|'admin'|undefined} portalHint
   */
  const login = useCallback(async (email, password) => {
    const res = await authService.login(email, password);
    const role = res.user?.role;

    if (role === "admin") {
      localStorage.setItem("nexcv_admin_token", res.token);
      localStorage.setItem("nexcv_token", res.token);
      setAdminToken(res.token);
      setAdminUser(res.user);
    } else if (role === "employer" || role === "recruiter") {
      localStorage.setItem("nexcv_employer_token", res.token);
      localStorage.setItem("nexcv_token", res.token);
      setEmployerToken(res.token);
      setEmployerUser(res.user);
    } else {
      localStorage.setItem("nexcv_candidate_token", res.token);
      localStorage.setItem("nexcv_token", res.token);
      setCandidateToken(res.token);
      setCandidateUser(res.user);
    }

    return res;
  }, []);

  /**
   * Đăng ký tài khoản mới và lưu đúng phân hệ
   * @param {object} data
   */
  const register = useCallback(async (data) => {
    const res = await authService.register(data);
    const role = res.user?.role;

    if (role === "employer" || role === "recruiter") {
      localStorage.setItem("nexcv_employer_token", res.token);
      localStorage.setItem("nexcv_token", res.token);
      setEmployerToken(res.token);
      setEmployerUser(res.user);
    } else {
      localStorage.setItem("nexcv_candidate_token", res.token);
      localStorage.setItem("nexcv_token", res.token);
      setCandidateToken(res.token);
      setCandidateUser(res.user);
    }

    return res;
  }, []);

  /**
   * Đăng xuất: chỉ xóa phiên của phân hệ hiện tại hoặc phân hệ được chỉ định
   * Không làm ảnh hưởng phân hệ còn lại
   * @param {'candidate'|'employer'|'admin'|undefined} portalHint
   */
  const logout = useCallback(async (portalHint) => {
    const target =
      portalHint ||
      (currentPath.startsWith("/admin")
        ? "admin"
        : currentPath.startsWith("/employer")
        ? "employer"
        : "candidate");

    try {
      await authService.logout();
    } catch {
      // bỏ qua lỗi API logout
    }

    if (target === "admin") {
      localStorage.removeItem("nexcv_admin_token");
      setAdminToken(null);
      setAdminUser(null);
    } else if (target === "employer") {
      localStorage.removeItem("nexcv_employer_token");
      setEmployerToken(null);
      setEmployerUser(null);
    } else {
      localStorage.removeItem("nexcv_candidate_token");
      setCandidateToken(null);
      setCandidateUser(null);
    }

    // Nếu nexcv_token đang giữ token của phân hệ vừa logout, dọn dẹp
    const currentLegacy = localStorage.getItem("nexcv_token");
    if (
      (target === "candidate" && currentLegacy === candidateToken) ||
      (target === "employer" && currentLegacy === employerToken) ||
      (target === "admin" && currentLegacy === adminToken)
    ) {
      localStorage.removeItem("nexcv_token");
    }
  }, [currentPath, candidateToken, employerToken, adminToken]);

  /**
   * Cập nhật thông tin profile
   */
  const updateUser = useCallback((data) => {
    if (currentPath.startsWith("/admin")) {
      setAdminUser((prev) => (prev ? { ...prev, ...data } : prev));
    } else if (currentPath.startsWith("/employer")) {
      setEmployerUser((prev) => (prev ? { ...prev, ...data } : prev));
    } else {
      setCandidateUser((prev) => (prev ? { ...prev, ...data } : prev));
    }
  }, [currentPath]);

  const value = useMemo(
    () => ({
      // Active context cho giao diện hiện tại
      user: activeUser,
      token: activeToken,
      loading,
      login,
      register,
      logout,
      updateUser,
      isAuthenticated: !!activeUser,
      isEmployer:
        activeUser?.role === "employer" || activeUser?.role === "recruiter",
      isAdmin: activeUser?.role === "admin",

      // Explicit states cho từng phân hệ
      candidateUser,
      candidateToken,
      isCandidateAuthenticated: !!candidateUser,

      employerUser,
      employerToken,
      isEmployerAuthenticated: !!employerUser,

      adminUser,
      adminToken,
      isAdminAuthenticated: !!adminUser,
    }),
    [
      activeUser,
      activeToken,
      loading,
      login,
      register,
      logout,
      updateUser,
      candidateUser,
      candidateToken,
      employerUser,
      employerToken,
      adminUser,
      adminToken,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
