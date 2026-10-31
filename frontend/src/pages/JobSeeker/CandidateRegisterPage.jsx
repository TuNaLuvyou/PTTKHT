import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  User,
  Mail,
  Phone,
  Lock,
  Building2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function StrengthBar({ password }) {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors = ["bg-rose-500", "bg-amber-500", "bg-yellow-400", "bg-emerald-500"];
  const labels = ["Rất yếu", "Yếu", "Trung bình", "Mạnh"];
  const activeColor = colors[score - 1] || "bg-slate-200";

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              i <= score ? activeColor : "bg-slate-200"
            )}
          />
        ))}
      </div>
      <div className="flex justify-between items-center text-[11px]">
        <span className="text-slate-400">Độ mạnh mật khẩu:</span>
        <span
          className={cn(
            "font-semibold",
            score <= 1
              ? "text-rose-600"
              : score === 2
              ? "text-amber-600"
              : score === 3
              ? "text-yellow-600"
              : "text-emerald-600"
          )}
        >
          {labels[score - 1] || ""}
        </span>
      </div>
    </div>
  );
}

export default function CandidateRegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const set = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Vui lòng nhập họ và tên";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      e.email = "Địa chỉ email không hợp lệ";
    if (form.phone && !form.phone.match(/^0[3-9]\d{8}$/))
      e.phone = "Số điện thoại không đúng định dạng (VD: 0901234567)";
    if (form.password.length < 6)
      e.password = "Mật khẩu phải chứa ít nhất 6 ký tự";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Mật khẩu xác nhận không trùng khớp";
    if (!agreed)
      e.agreed = "Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo mật";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await register({ ...form, role: "candidate" });
      navigate("/");
    } catch (err) {
      setErrors({ submit: err?.message || "Đăng ký tài khoản thất bại. Vui lòng thử lại." });
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
            Tạo tài khoản ứng viên
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Tạo CV chuẩn ATS và tiếp cận hàng ngàn cơ hội nghề nghiệp.
          </p>

          <div className="space-y-3">
            {[
              "Tạo CV chuyên nghiệp, xuất file PDF nhanh chóng",
              "AI chấm điểm ATS tức thì và gợi ý cải thiện",
              "Kết nối trực tiếp tới nhà tuyển dụng hàng đầu",
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

      {/* Right panel: Registration form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-6">
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
                Đăng ký tài khoản
              </h1>
              <p className="text-slate-500 text-sm">
                Đã có tài khoản?{" "}
                <Link
                  to="/login"
                  className="text-[#1549B8] font-bold hover:underline"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>

            {/* Error submission alert */}
            {errors.submit && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 flex items-start gap-2.5">
                <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-medium leading-snug">{errors.submit}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Họ và tên *
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="name"
                    placeholder="Nguyễn Văn An"
                    value={form.name}
                    onChange={set("name")}
                    className={cn(
                      "pl-10 h-11 rounded-xl border-slate-200 focus:border-[#1549B8] focus:ring-2 focus:ring-[#1549B8]/20 text-sm",
                      errors.name && "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                    )}
                  />
                </div>
                {errors.name && <p className="text-xs text-rose-600 font-medium">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Địa chỉ Email *
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
                    className={cn(
                      "pl-10 h-11 rounded-xl border-slate-200 focus:border-[#1549B8] focus:ring-2 focus:ring-[#1549B8]/20 text-sm",
                      errors.email && "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                    )}
                  />
                </div>
                {errors.email && <p className="text-xs text-rose-600 font-medium">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Số điện thoại
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="phone"
                    placeholder="0901 234 567"
                    value={form.phone}
                    onChange={set("phone")}
                    className={cn(
                      "pl-10 h-11 rounded-xl border-slate-200 focus:border-[#1549B8] focus:ring-2 focus:ring-[#1549B8]/20 text-sm",
                      errors.phone && "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                    )}
                  />
                </div>
                {errors.phone && <p className="text-xs text-rose-600 font-medium">{errors.phone}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Mật khẩu *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Tối thiểu 6 ký tự"
                    value={form.password}
                    onChange={set("password")}
                    className={cn(
                      "pl-10 pr-10 h-11 rounded-xl border-slate-200 focus:border-[#1549B8] focus:ring-2 focus:ring-[#1549B8]/20 text-sm",
                      errors.password && "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <StrengthBar password={form.password} />
                {errors.password && <p className="text-xs text-rose-600 font-medium">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Xác nhận mật khẩu *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPass ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu"
                    value={form.confirmPassword}
                    onChange={set("confirmPassword")}
                    className={cn(
                      "pl-10 pr-10 h-11 rounded-xl border-slate-200 focus:border-[#1549B8] focus:ring-2 focus:ring-[#1549B8]/20 text-sm",
                      errors.confirmPassword && "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-600 font-medium">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms agreement */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-[#1549B8] focus:ring-[#1549B8] shrink-0 cursor-pointer accent-[#1549B8]"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    Tôi đồng ý với{" "}
                    <a href="#" className="text-[#1549B8] font-semibold hover:underline">
                      Điều khoản dịch vụ
                    </a>{" "}
                    và{" "}
                    <a href="#" className="text-[#1549B8] font-semibold hover:underline">
                      Chính sách bảo mật
                    </a>{" "}
                    của NexCV.
                  </span>
                </label>
                {errors.agreed && (
                  <p className="text-xs text-rose-600 font-medium mt-1">{errors.agreed}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-[#1549B8] hover:bg-[#1240A0] text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tạo tài khoản...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Tạo tài khoản miễn phí <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Switch to Employer Portal */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <Link
                to="/employer/register"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#1549B8] font-semibold transition-colors"
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Bạn là Nhà tuyển dụng? Đăng ký tại đây</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
