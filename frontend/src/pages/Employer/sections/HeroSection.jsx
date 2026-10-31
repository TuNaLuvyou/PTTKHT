import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Rocket, Building2, Bot, Users, Zap, CheckCircle2, ArrowRight } from "lucide-react";

export function HeroSection() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative bg-[#0F172A] overflow-hidden pt-16 pb-12 lg:pt-20 lg:pb-14 text-white">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-140 h-140 rounded-full bg-[#7C3AED]/20 blur-[130px]" />
        <div className="absolute top-1/3 right-0 w-120 h-120 rounded-full bg-[#6D28D9]/20 blur-[130px]" />
      </div>

      <div className="container-app relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-10">
          {/* Left Column: Heading + CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight mb-3 text-white">
              Tuyển dụng nhanh hơn
              <br />
              <span className="bg-linear-to-r from-purple-300 via-indigo-200 to-violet-300 bg-clip-text text-transparent">
                với sức mạnh AI
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base mb-6 max-w-md">
              Đăng tin tuyển dụng và tự động xếp hạng ứng viên phù hợp với JD.
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              <Button
                size="lg"
                onClick={() => navigate(isAuthenticated ? "/employer/dashboard" : "/employer/register")}
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold h-11 px-6 rounded-xl shadow-md cursor-pointer transition-all active:scale-[0.99]"
              >
                <Rocket className="h-4 w-4 mr-1.5" />
                {isAuthenticated ? "Vào Dashboard" : "Đăng ký tuyển dụng miễn phí"}
              </Button>
              {!isAuthenticated && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/employer/login")}
                  className="border-slate-700 text-white bg-slate-800/60 hover:bg-slate-700/80 hover:text-white font-bold h-11 px-5 rounded-xl cursor-pointer"
                >
                  Đăng nhập
                </Button>
              )}
            </div>

            {/* Popular Positions */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>Vị trí phổ biến:</span>
              {[
                "Frontend",
                "Product Manager",
                "Data Analyst",
                "UI/UX",
                "DevOps",
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => navigate(isAuthenticated ? "/employer/jobs/new" : "/employer/register")}
                  className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Candidate Match Mockup (No inner dividers, rounded-3xl) */}
          <div className="lg:col-span-5 relative">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#7C3AED] to-[#9333EA] flex items-center justify-center font-bold text-white shadow-sm">
                    TQ
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Trần Minh Quân</h3>
                    <p className="text-xs text-slate-400">Senior Frontend • 4 năm KN</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                  Khớp 94% JD
                </span>
              </div>

              {/* Match Highlights */}
              <div className="space-y-2.5 mb-5 bg-slate-800/50 p-4 rounded-2xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Kỹ năng trùng khớp:</span>
                  <span className="font-bold text-emerald-400">14/15</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["React 19", "TypeScript", "Tailwind CSS", "REST API"].map((skill) => (
                    <span
                      key={skill}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-300 pt-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Điểm ATS: 94/100 (Hạng A+)</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => navigate(isAuthenticated ? "/employer/applicants" : "/employer/register")}
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold py-2 rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-sm"
              >
                <span>Lọc ứng viên bằng AI</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="border-t border-slate-800/80 pt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "3,500+", label: "Doanh nghiệp tin dùng", icon: Building2 },
            { value: "50,000+", label: "Hồ sơ đã phân tích", icon: Bot },
            { value: "12,000+", label: "Ứng viên chất lượng", icon: Users },
            { value: "30 Giây", label: "Chấm điểm tự động", icon: Zap },
          ].map((stat) => {
            const StatIcon = stat.icon;
            return (
              <div key={stat.value} className="flex items-center gap-3">
                <StatIcon className="h-5 w-5 text-purple-300 shrink-0" />
                <div>
                  <div className="text-xl font-black text-white">{stat.value}</div>
                  <div className="text-xs text-slate-400">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
