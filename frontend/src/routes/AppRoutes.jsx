import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import EmployerLayout from "../components/layout/EmployerLayout";
import AdminLayout from "../components/layout/AdminLayout";

// ── Ứng viên (Job Seeker / Candidate) ────────────────────────────────────────
import HomePage from "../pages/Home/HomePage";
import CandidateLoginPage from "../pages/JobSeeker/CandidateLoginPage";
import CandidateRegisterPage from "../pages/JobSeeker/CandidateRegisterPage";
import CandidateJobsPage from "../pages/JobSeeker/CandidateJobsPage";
import JobDetailPage from "../pages/JobSeeker/JobDetailPage";
import CandidateProfilePage from "../pages/JobSeeker/CandidateProfilePage";
import CVUploadPage from "../pages/CVScoring/CVUploadPage";
import CVBuilderPage from "../pages/CVBuilder/CVBuilderPage";
import ForgotPasswordPage from "../pages/JobSeeker/ForgotPasswordPage";
import ResetPasswordPage from "../pages/JobSeeker/ResetPasswordPage";

// ── Nhà tuyển dụng (Employer) ─────────────────────────────────────────────────
import EmployerHomePage from "../pages/Employer/EmployerHomePage";
import EmployerLoginPage from "../pages/Employer/EmployerLoginPage";
import EmployerRegisterPage from "../pages/Employer/EmployerRegisterPage";
import EmployerProfilePage from "../pages/Employer/EmployerProfilePage";
import EmployerDashboard from "../pages/Employer/EmployerDashboard";
import EmployerJobsPage from "../pages/Employer/EmployerJobsPage";
import EmployerJobFormPage from "../pages/Employer/EmployerJobFormPage";
import EmployerApplicantsPage from "../pages/Employer/EmployerApplicantsPage";
import EmployerCandidateProfilePage from "../pages/Employer/CandidateProfilePage";

// ── Quản trị viên (Admin) ─────────────────────────────────────────────────────
import AdminLoginPage from "../pages/Admin/AdminLoginPage";
import AdminDashboard from "../pages/Admin/AdminDashboardPage";
import AdminUsersPage from "../pages/Admin/AdminUsersPage";
import AdminJobsPage from "../pages/Admin/AdminJobsPage";
import AdminJobDetailsPage from "../pages/Admin/AdminJobDetailsPage";
import AdminCVScoresPage from "../pages/Admin/AdminCVScoresPage";
import AdminNotificationsPage from "../pages/Admin/AdminNotificationsPage";
import AdminReportsPage from "../pages/Admin/AdminReportsPage";
import AdminSettingsPage from "../pages/Admin/AdminSettingsPage";
import NotFoundPage from "../pages/NotFoundPage";
import Spinner from "@/components/common/Spinner";

// ── Protected Route (phân định theo từng phân hệ tách biệt) ──────────────────
function ProtectedRoute({ children, requireRole }) {
  const { candidateUser, employerUser, adminUser, loading } = useAuth();

  if (loading) return <Spinner fullPage />;

  // 1. Phân hệ Admin
  if (requireRole === "admin") {
    if (!adminUser) return <Navigate to="/admin/login" replace />;
    if (adminUser.role !== "admin") return <Navigate to="/404" replace />;
    return children;
  }

  // 2. Phân hệ Nhà tuyển dụng
  if (requireRole === "employer") {
    if (!employerUser) return <Navigate to="/employer/login" replace />;
    if (employerUser.role !== "employer" && employerUser.role !== "recruiter") {
      return <Navigate to="/employer/login" replace />;
    }
    return children;
  }

  // 3. Phân hệ Ứng viên
  if (requireRole === "candidate") {
    if (!candidateUser) return <Navigate to="/login" replace />;
    return children;
  }

  return children;
}

// ── Guest Route (chỉ cho phép khi chưa đăng nhập tại phân hệ tương ứng) ─────────
function GuestRoute({ children, portal = "candidate" }) {
  const { candidateUser, employerUser, adminUser, loading } = useAuth();

  if (loading) return <Spinner fullPage />;

  if (portal === "admin") {
    if (adminUser) return <Navigate to="/admin" replace />;
    return children;
  }

  if (portal === "employer") {
    if (employerUser) return <Navigate to="/employer/dashboard" replace />;
    return children;
  }

  // portal === "candidate"
  if (candidateUser) return <Navigate to="/" replace />;
  return children;
}

// ── Layout ứng viên — dùng Header/Footer ────────────────────────────────────
function SeekerLayout({ children }) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
    >
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function HomeRoute() {
  const { isAdmin, loading } = useAuth();
  if (loading) return <Spinner fullPage />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return (
    <SeekerLayout>
      <HomePage />
    </SeekerLayout>
  );
}

function EmployerHomeRoute() {
  const { employerUser, loading } = useAuth();
  if (loading) return <Spinner fullPage />;
  if (employerUser) return <Navigate to="/employer/dashboard" replace />;
  return (
    <EmployerLayout>
      <EmployerHomePage />
    </EmployerLayout>
  );
}

function EmployerLoginRoute() {
  return (
    <GuestRoute portal="employer">
      <EmployerLayout>
        <EmployerLoginPage />
      </EmployerLayout>
    </GuestRoute>
  );
}

function EmployerRegisterRoute() {
  const { employerUser, loading } = useAuth();
  if (loading) return <Spinner fullPage />;
  if (employerUser) return <Navigate to="/employer/dashboard" replace />;

  return (
    <EmployerLayout>
      <EmployerRegisterPage />
    </EmployerLayout>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Ứng viên — SeekerLayout ── */}
      <Route path="/" element={<HomeRoute />} />
      <Route
        path="/login"
        element={
          <GuestRoute portal="candidate">
            <SeekerLayout>
              <CandidateLoginPage />
            </SeekerLayout>
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute portal="candidate">
            <SeekerLayout>
              <CandidateRegisterPage />
            </SeekerLayout>
          </GuestRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <SeekerLayout>
            <CandidateJobsPage />
          </SeekerLayout>
        }
      />
      <Route
        path="/jobs/:id"
        element={
          <SeekerLayout>
            <JobDetailPage />
          </SeekerLayout>
        }
      />
      <Route
        path="/cv-upload"
        element={
          <SeekerLayout>
            <ProtectedRoute requireRole="candidate">
              <CVUploadPage />
            </ProtectedRoute>
          </SeekerLayout>
        }
      />
      <Route
        path="/cv-builder"
        element={
          <SeekerLayout>
            <ProtectedRoute requireRole="candidate">
              <CVBuilderPage />
            </ProtectedRoute>
          </SeekerLayout>
        }
      />
      <Route
        path="/cv-builder/:id"
        element={
          <SeekerLayout>
            <ProtectedRoute requireRole="candidate">
              <CVBuilderPage />
            </ProtectedRoute>
          </SeekerLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <SeekerLayout>
            <ProtectedRoute requireRole="candidate">
              <CandidateProfilePage />
            </ProtectedRoute>
          </SeekerLayout>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <GuestRoute portal="candidate">
            <SeekerLayout>
              <ForgotPasswordPage />
            </SeekerLayout>
          </GuestRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <GuestRoute portal="candidate">
            <SeekerLayout>
              <ResetPasswordPage />
            </SeekerLayout>
          </GuestRoute>
        }
      />

      {/* ── Nhà tuyển dụng — auth pages ── */}
      <Route path="/employer/login" element={<EmployerLoginRoute />} />
      <Route path="/employer/register" element={<EmployerRegisterRoute />} />

      {/* ── Nhà tuyển dụng — EmployerLayout (header riêng) ── */}
      <Route
        path="/employer"
        element={<EmployerHomeRoute />}
      />
      <Route
        path="/employer/dashboard"
        element={
          <EmployerLayout>
            <ProtectedRoute requireRole="employer">
              <EmployerDashboard />
            </ProtectedRoute>
          </EmployerLayout>
        }
      />
      <Route
        path="/employer/jobs"
        element={
          <EmployerLayout>
            <ProtectedRoute requireRole="employer">
              <EmployerJobsPage />
            </ProtectedRoute>
          </EmployerLayout>
        }
      />
      <Route
        path="/employer/profile"
        element={
          <EmployerLayout>
            <ProtectedRoute requireRole="employer">
              <EmployerProfilePage />
            </ProtectedRoute>
          </EmployerLayout>
        }
      />
      <Route
        path="/employer/jobs/new"
        element={
          <EmployerLayout>
            <ProtectedRoute requireRole="employer">
              <EmployerJobFormPage />
            </ProtectedRoute>
          </EmployerLayout>
        }
      />
      <Route
        path="/employer/jobs/:id/edit"
        element={
          <EmployerLayout>
            <ProtectedRoute requireRole="employer">
              <EmployerJobFormPage />
            </ProtectedRoute>
          </EmployerLayout>
        }
      />
      <Route
        path="/employer/jobs/:id/applicants"
        element={
          <EmployerLayout>
            <ProtectedRoute requireRole="employer">
              <EmployerApplicantsPage />
            </ProtectedRoute>
          </EmployerLayout>
        }
      />
      <Route
        path="/candidates/:id"
        element={
          <EmployerLayout>
            <ProtectedRoute requireRole="employer">
              <EmployerCandidateProfilePage />
            </ProtectedRoute>
          </EmployerLayout>
        }
      />

      {/* ── Quản trị viên (Admin) ── */}
      <Route
        path="/admin/login"
        element={
          <GuestRoute portal="admin">
            <AdminLoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="jobs" element={<AdminJobsPage />} />
        <Route path="jobs/:id" element={<AdminJobDetailsPage />} />
        <Route path="cv-scores" element={<AdminCVScoresPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* ── 404 & Fallback ── */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
