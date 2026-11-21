import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function HeroSection() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <section className="bg-[#0F172A] text-white pt-28 pb-20 sm:pt-36 sm:pb-28 lg:pt-40 lg:pb-32">
      <div className="container-app">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Heading, Subline, Action Buttons */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white mb-5 [text-wrap:balance]">
              Tuyển dụng nhanh hơn. Chuẩn hóa bằng ATS.
            </h1>
            <p className="text-slate-300 text-base sm:text-lg mb-8 max-w-xl leading-relaxed [text-wrap:pretty]">
              Đăng tin tuyển dụng và tự động phân tích mức độ tương thích của ứng viên với yêu cầu công việc.
            </p>

            <div className="flex flex-wrap gap-3 mb-6">
              <Button
                onClick={() => navigate(isAuthenticated ? "/employer/dashboard" : "/employer/register")}
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold h-12 px-7 rounded-xl shadow-none cursor-pointer"
              >
                <span>{isAuthenticated ? "Vào Dashboard" : "Đăng ký tuyển dụng"}</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
              {!isAuthenticated && (
                <Button
                  variant="outline"
                  onClick={() => navigate("/employer/login")}
                  className="border-slate-700 text-white bg-slate-800/80 hover:bg-slate-700 text-sm font-semibold h-12 px-6 rounded-xl cursor-pointer"
                >
                  Đăng nhập
                </Button>
              )}
            </div>

            {/* Popular positions as quiet text */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
              <span className="text-slate-500">Vị trí phổ biến:</span>
              {["Frontend", "Backend", "Product Manager", "Data Analyst", "DevOps"].map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => navigate(`/employer/jobs/new?title=${encodeURIComponent(pos)}`)}
                  className="hover:text-white transition-colors cursor-pointer underline-offset-4 hover:underline"
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Candidate Matching Inspection Preview */}
          <div className="lg:col-span-5">
            <div className="bg-[#1E1B4B] rounded-3xl p-6 sm:p-8 text-white shadow-xl">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-indigo-900/60">
                <div>
                  <h3 className="font-semibold text-base text-white">Sàng lọc ứng viên tự động</h3>
                  <p className="text-xs text-indigo-200 mt-0.5">Xếp hạng theo tiêu chuẩn JD</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-purple-300 tabular-nums">92%</span>
                  <span className="text-xs text-indigo-300 ml-1">phù hợp</span>
                </div>
              </div>

              <div className="space-y-4 mb-7 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-indigo-900/40">
                  <span className="text-indigo-200">Kỹ năng chuyên môn</span>
                  <span className="font-semibold text-white tabular-nums">95%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-indigo-900/40">
                  <span className="text-indigo-200">Số năm kinh nghiệm</span>
                  <span className="font-semibold text-purple-300">Đạt yêu cầu</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-indigo-200">Định dạng hồ sơ</span>
                  <span className="font-semibold text-emerald-400">Chuẩn ATS</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => navigate(isAuthenticated ? "/employer/jobs/new" : "/employer/register")}
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold h-11 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <span>Đăng tin tuyển dụng ngay</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
