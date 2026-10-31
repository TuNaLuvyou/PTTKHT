import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Bot, ArrowRight, CheckCircle2 } from "lucide-react";

const SCORE_BARS = [
  { label: "Kỹ năng phù hợp", pct: 94, color: "#34D399" },
  { label: "Kinh nghiệm chuyên môn", pct: 90, color: "#A78BFA" },
  { label: "Học vấn & Bằng cấp", pct: 88, color: "#818CF8" },
  { label: "Độ chuẩn xác định dạng ATS", pct: 92, color: "#FCD34D" },
];

export function AIPromoSection() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <section className="section bg-white">
      <div className="container-app">
        <div className="rounded-3xl bg-linear-to-br from-[#0F172A] via-[#1E1B4B] to-[#4C1D95] p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden shadow-xl text-white">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Left content */}
          <div className="flex-1 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold mb-3">
              <Bot className="h-3.5 w-3.5" />
              <span>AI Candidate Matching</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 leading-tight">
              Lọc ứng viên thông minh
              <br />
              với AI chấm điểm CV
            </h2>
            <p className="text-slate-300 text-sm md:text-base mb-6 max-w-lg">
              Tự động phân tích và xếp hạng hồ sơ theo mức độ tương thích với JD trong 30 giây.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => navigate(isAuthenticated ? "/employer/dashboard" : "/employer/register")}
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold h-11 px-6 rounded-xl shadow-md cursor-pointer"
              >
                <span>{isAuthenticated ? "Vào Dashboard" : "Dùng thử miễn phí"}</span>
              </Button>
              {!isAuthenticated && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/employer/login")}
                  className="border-white/30 text-white bg-white/10 hover:bg-white/20 hover:text-white font-semibold h-11 px-5 rounded-xl cursor-pointer"
                >
                  <span>Đăng nhập</span>
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Right Preview Card */}
          <div className="w-full md:w-80 bg-white/10 backdrop-blur-md rounded-2xl p-5 shrink-0 shadow-lg border border-white/10">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto rounded-full border-4 border-purple-400 bg-purple-500/20 flex items-center justify-center mb-1.5">
                <span className="text-2xl font-black text-white">94</span>
              </div>
              <p className="text-purple-200 text-xs font-bold">Điểm tương thích — Nguyễn Văn An</p>
            </div>

            <div className="space-y-2">
              {SCORE_BARS.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1 text-slate-200">
                    <span>{item.label}</span>
                    <span className="font-bold text-white">{item.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-300 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Đạt tiêu chuẩn phỏng vấn trực tiếp</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
