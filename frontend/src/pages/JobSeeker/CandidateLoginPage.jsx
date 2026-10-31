import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle, ArrowRight, Lock, Mail, Building2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CandidateLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const set = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Vui lòng điền đầy đủ email và mật khẩu.");
      return;
    }
    setLoading(true);
    try {
      const res = await login(form.email, form.password);
      if (res.user.role === "admin") {
        navigate("/admin", { replace: true });
        return;
      }
      if (res.user.role === "employer" || res.user.role === "recruiter") {
        navigate("/employer/dashboard", { replace: true });
        return;
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Left panel: Brand hero (desktop only) */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-linear-to-br from-[#0F172A] via-[#1E3A8A] to-[#1549B8] flex-col justify-center p-12 xl:p-16 relative overflow-hidden text-white">
        {/* Ambient lighting effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Center content */}
        <div className="relative z-10 max-w-lg">
          <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight mb-3">
            Chào mừng trở lại 👋
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Đăng nhập để tối ưu CV và khám phá các vị trí tuyển dụng mới.
          </p>

          <div className="space-y-3">
            {[
              "Chấm điểm độ tương thích CV với JD theo chuẩn ATS",
              "Tạo CV trực quan, tải về định dạng PDF sắc nét",
              "Kết nối hơn 12,000+ công việc chất lượng cao",
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-slate-200 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel: Login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[#1549B8] rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-sm">N</span>
            </div>
            <span className="font-black text-xl text-[#0F172A] tracking-tight">
              Nex<span className="text-[#1549B8]">CV</span>
            </span>
          </Link>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-7 sm:p-9">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] mb-1.5">
                Đăng nhập
              </h1>
              <p className="text-slate-500 text-sm">
                Chưa có tài khoản?{" "}
                <Link
                  to="/register"
                  className="text-[#1549B8] font-bold hover:underline"
                >
                  Đăng ký ứng viên
                </Link>
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div
                className={`mb-5 p-3.5 rounded-xl text-sm flex items-start gap-2.5 ${
                  error.includes("bị cấm")
                    ? "bg-rose-50 border border-rose-200 text-rose-700"
                    : "bg-rose-50 border border-rose-200 text-rose-700"
                }`}
              >
                <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-snug text-xs sm:text-sm font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Địa chỉ Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nguyenvanan@example.com"
                    autoComplete="email"
                    value={form.email}
                    onChange={set("email")}
                    className="pl-10 h-11 rounded-xl border-slate-200 focus:border-[#1549B8] focus:ring-2 focus:ring-[#1549B8]/20 text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Mật khẩu
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-[#1549B8] hover:underline font-semibold"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Nhập mật khẩu của bạn"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={set("password")}
                    className="pl-10 pr-10 h-11 rounded-xl border-slate-200 focus:border-[#1549B8] focus:ring-2 focus:ring-[#1549B8]/20 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-[#1549B8] hover:bg-[#1240A0] text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang đăng nhập...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Đăng nhập <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Switch to Employer Portal */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <Link
                to="/employer/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#1549B8] font-semibold transition-colors"
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Bạn là Nhà tuyển dụng? Đăng nhập tại đây</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
