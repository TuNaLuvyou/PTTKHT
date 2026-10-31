import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Mail,
  User,
  Building2,
  Lock,
  Rocket,
  AlertTriangle,
  Info,
  Eye,
  EyeOff,
  Phone,
  Globe,
  Briefcase,
  Loader2,
} from "lucide-react";

function PasswordStrength({ password }) {
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
        <span className="text-slate-400">Độ bảo mật:</span>
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

export default function EmployerRegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const prefill = (() => {
    try {
      const raw = sessionStorage.getItem("employer_register_prefill");
      if (raw) {
        sessionStorage.removeItem("employer_register_prefill");
        return JSON.parse(raw);
      }
    } catch {
      /* empty */
    }
    return {};
  })();

  const [form, setForm] = useState({
    name: prefill.name || "",
    email: prefill.email || "",
    phone: prefill.phone || "",
    password: "",
    confirmPassword: "",
    companyName: "",
    companyWebsite: "",
    industry: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const set = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Vui lòng nhập họ và tên người đại diện";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      errs.email = "Địa chỉ email không hợp lệ";
    if (form.phone && !form.phone.match(/^(0[3-9]\d{8})$/))
      errs.phone = "Số điện thoại không hợp lệ (VD: 0901234567)";
    if (!form.companyName.trim())
      errs.companyName = "Vui lòng nhập tên doanh nghiệp";
    if (form.password.length < 6)
      errs.password = "Mật khẩu phải chứa ít nhất 6 ký tự";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Mật khẩu xác nhận không khớp";
    if (!agreed)
      errs.agreed = "Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo mật";
    return errs;
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
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: "employer",
        companyName: form.companyName,
        companyWebsite: form.companyWebsite,
        industry: form.industry,
      });
      navigate("/employer/dashboard");
    } catch (err) {
      setErrors({ submit: err?.message || "Đăng ký tài khoản thất bại. Vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 text-[#7C3AED] text-xs font-bold mb-2.5">
            <Building2 className="h-3.5 w-3.5" />
            <span>Cổng Nhà Tuyển Dụng</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Tạo tài khoản tuyển dụng
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Tiếp cận 50,000+ nhân tài và tự động đối soát ứng viên bằng AI.
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Đã có tài khoản?{" "}
              <Link to="/employer/login" className="text-[#7C3AED] font-bold hover:underline">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>

        {/* Global Error Banner */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs sm:text-sm text-rose-700 flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
            <span className="font-medium">{errors.submit}</span>
          </div>
        )}

        {/* Prefill note */}
        {(prefill.name || prefill.email) && (
          <div className="mb-6 p-4 bg-purple-50 rounded-2xl text-xs sm:text-sm text-[#7C3AED] flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0" />
            <span>Thông tin cá nhân đã được tự động điền từ tài khoản của bạn.</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Column 1 (Left - 6 cols): Company Information */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">Thông tin doanh nghiệp</h2>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="companyName" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Tên doanh nghiệp / Công ty <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    placeholder="VD: Công ty Cổ phần Công nghệ NexCV"
                    value={form.companyName}
                    onChange={set}
                    className={cn(
                      "h-11 rounded-xl bg-white border-slate-200 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 text-sm",
                      errors.companyName && "border-rose-300"
                    )}
                  />
                  {errors.companyName && <p className="text-xs text-rose-600">{errors.companyName}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="industry" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Lĩnh vực hoạt động
                  </Label>
                  <div className="relative">
                    <select
                      id="industry"
                      name="industry"
                      value={form.industry}
                      onChange={set}
                      className="w-full h-11 px-3.5 rounded-xl bg-white border-2 border-slate-200 text-sm text-slate-800 focus:border-[#7C3AED] outline-none transition-colors"
                    >
                      <option value="">Chọn lĩnh vực</option>
                      {[
                        "Công nghệ thông tin",
                        "Tài chính - Ngân hàng",
                        "Thương mại điện tử",
                        "Marketing & Truyền thông",
                        "Giáo dục & Đào tạo",
                        "Y tế & Sức khỏe",
                        "Sản xuất & Bán lẻ",
                        "Khác",
                      ].map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="companyWebsite" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Website công ty
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="companyWebsite"
                      name="companyWebsite"
                      placeholder="https://company.com"
                      value={form.companyWebsite}
                      onChange={set}
                      className="pl-10 h-11 rounded-xl bg-white border-slate-200 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 text-sm"
                    />
                  </div>
                </div>

                {/* Employer Privileges (Soft purple container) */}
                <div className="bg-[#F5F3FF] rounded-2xl p-5 space-y-3 mt-2">
                  <p className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider">
                    Quyền lợi nhà tuyển dụng:
                  </p>
                  <div className="space-y-2.5">
                    {[
                      "Đăng tin tuyển dụng và tiếp cận hơn 50,000+ hồ sơ",
                      "AI tự động phân tích và xếp hạng CV chuẩn ATS",
                      "Quản lý trạng thái ứng tuyển và liên hệ trực quan",
                    ].map((text, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700">
                        <div className="w-5 h-5 rounded-full bg-purple-100 text-[#7C3AED] flex items-center justify-center shrink-0">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-medium">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2 (Right - 6 cols): Contact Person & Security */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">Người liên hệ & Bảo mật</h2>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Họ và tên người đại diện <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="name"
                      name="name"
                      placeholder="Nguyễn Văn An"
                      value={form.name}
                      onChange={set}
                      className={cn(
                        "pl-10 h-11 rounded-xl bg-white border-slate-200 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 text-sm",
                        errors.name && "border-rose-300"
                      )}
                    />
                  </div>
                  {errors.name && <p className="text-xs text-rose-600">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Email công việc <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="hr@company.com"
                        value={form.email}
                        onChange={set}
                        className={cn(
                          "pl-10 h-11 rounded-xl bg-white border-slate-200 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 text-sm",
                          errors.email && "border-rose-300"
                        )}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-rose-600">{errors.email}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Số điện thoại
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="0901 234 567"
                        value={form.phone}
                        onChange={set}
                        className={cn(
                          "pl-10 h-11 rounded-xl bg-white border-slate-200 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 text-sm",
                          errors.phone && "border-rose-300"
                        )}
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-rose-600">{errors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Mật khẩu <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPass ? "text" : "password"}
                        placeholder="Tối thiểu 6 ký tự"
                        value={form.password}
                        onChange={set}
                        className={cn(
                          "pl-10 pr-10 h-11 rounded-xl bg-white border-slate-200 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 text-sm",
                          errors.password && "border-rose-300"
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
                    <PasswordStrength password={form.password} />
                    {errors.password && <p className="text-xs text-rose-600">{errors.password}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Xác nhận mật khẩu <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPass ? "text" : "password"}
                        placeholder="Nhập lại mật khẩu"
                        value={form.confirmPassword}
                        onChange={set}
                        className={cn(
                          "pl-10 pr-10 h-11 rounded-xl bg-white border-slate-200 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 text-sm",
                          errors.confirmPassword && "border-rose-300"
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
                      <p className="text-xs text-rose-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-[#7C3AED] focus:ring-[#7C3AED] shrink-0 cursor-pointer accent-[#7C3AED]"
                    />
                    <span className="text-xs text-slate-600 leading-relaxed">
                      Tôi đồng ý với{" "}
                      <a href="#" className="text-[#7C3AED] font-semibold hover:underline">
                        Điều khoản dịch vụ
                      </a>{" "}
                      và{" "}
                      <a href="#" className="text-[#7C3AED] font-semibold hover:underline">
                        Chính sách bảo mật
                      </a>{" "}
                      của NexCV.
                    </span>
                  </label>
                  {errors.agreed && (
                    <p className="text-xs text-rose-600 font-medium mt-1">{errors.agreed}</p>
                  )}
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] cursor-pointer mt-1"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang xử lý đăng ký...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Rocket className="h-4 w-4" /> Đăng ký tài khoản doanh nghiệp
                    </span>
                  )}
                </Button>

                {/* Switch to Candidate Portal */}
                <p className="text-center text-xs text-slate-400 pt-2">
                  Bạn là ứng viên tìm việc?{" "}
                  <Link
                    to="/register"
                    className="text-[#7C3AED] font-semibold hover:underline"
                  >
                    Đăng ký tại cổng ứng viên
                  </Link>
                </p>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
