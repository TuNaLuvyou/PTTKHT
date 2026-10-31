import { Link } from "react-router-dom";
import {
  ArrowRight,
  Users,
  FileEdit,
  Upload,
  Bot,
  BarChart3,
  Rocket,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const HOW_IT_WORKS = [
  { num: "01", icon: Upload, title: "Tải CV" },
  { num: "02", icon: Bot, title: "AI phân tích" },
  { num: "03", icon: BarChart3, title: "Xem điểm ATS" },
  { num: "04", icon: Rocket, title: "Ứng tuyển" },
];

const SCORE_BARS = [
  { label: "Kỹ năng phù hợp", pct: 85, color: "#34D399" },
  { label: "Kinh nghiệm", pct: 78, color: "#60A5FA" },
  { label: "Định dạng & ATS", pct: 72, color: "#FCD34D" },
  { label: "Từ khóa JD", pct: 65, color: "#F87171" },
];

export function AIPromoSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="container-app">
        <div className="rounded-3xl bg-linear-to-br from-[#0F172A] via-[#1E3A6E] to-[#1549B8] p-8 sm:p-12 md:p-14 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Left: Text & CTA */}
          <div className="flex-1 relative z-10 text-white">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 leading-tight">
              CV của bạn đã chuẩn ATS?
            </h2>
            <p className="text-slate-300 mb-8 text-sm md:text-base max-w-lg leading-relaxed">
              Phân tích độ tương thích và nhận gợi ý tối ưu trong 30 giây.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-white text-[#1549B8] hover:bg-slate-100 font-bold h-11 px-6 rounded-xl shadow-md cursor-pointer">
                <Link to="/cv-upload">
                  Chấm điểm CV ngay
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: Clean score widget */}
          <div className="w-full md:w-80 bg-white/10 backdrop-blur-md rounded-2xl p-6 shrink-0 text-white shadow-lg">
            <div className="text-center mb-5">
              <div className="w-18 h-18 mx-auto rounded-full border-4 border-blue-400 bg-blue-500/20 flex items-center justify-center mb-2">
                <span className="text-2xl font-black text-white">82</span>
              </div>
              <p className="text-blue-200 text-xs font-semibold">Điểm ATS của bạn</p>
            </div>
            {SCORE_BARS.map((item) => (
              <div key={item.label} className="mb-2.5">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-200">{item.label}</span>
                  <span className="text-white font-bold">{item.pct}%</span>
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
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#F8FAFC]">
      <div className="container-app">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] mb-2">Cách hoạt động</h2>
          <p className="text-slate-500 text-sm">4 bước đơn giản để tối ưu hồ sơ</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
          {HOW_IT_WORKS.map((step) => {
            const StepIcon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white rounded-2xl p-6 sm:p-7 text-center shadow-xs hover:shadow-md transition-all flex flex-col items-center justify-center min-h-[160px]"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
                  <StepIcon size={24} className="text-[#1549B8]" />
                </div>
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  Bước {step.num}
                </span>
                <h3 className="font-bold text-[#0F172A] text-sm sm:text-base">{step.title}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function CTASplitSection({ onCreateCV }) {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="container-app">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Candidate Card - Blue */}
          <div className="bg-linear-to-br from-[#1549B8] to-[#1E40AF] rounded-3xl p-8 sm:p-10 lg:p-12 text-white flex flex-col justify-between shadow-lg min-h-[260px]">
            <div>
              <Users className="h-8 w-8 mb-4 opacity-90" />
              <h3 className="text-2xl sm:text-3xl font-black mb-2.5">Dành cho ứng viên</h3>
              <p className="text-blue-100 text-sm sm:text-base mb-8 max-w-md">
                Tạo CV chuẩn ATS và kết nối với hàng ngàn nhà tuyển dụng.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={onCreateCV}
                className="bg-white text-[#1549B8] hover:bg-slate-100 font-bold rounded-xl gap-2 cursor-pointer shadow-sm h-11 px-5"
              >
                <FileEdit className="h-4 w-4" />
                Tạo CV ngay
              </Button>
              <Button
                variant="outline"
                asChild
                className="border-white/30 text-white bg-transparent hover:bg-white/10 font-bold rounded-xl h-11 px-5"
              >
                <Link to="/register">Đăng ký miễn phí</Link>
              </Button>
            </div>
          </div>

          {/* Employer Card - Purple */}
          <div className="bg-linear-to-br from-[#1E1B4B] via-[#312E81] to-[#4C1D95] rounded-3xl p-8 sm:p-10 lg:p-12 text-white flex flex-col justify-between shadow-lg min-h-[260px]">
            <div>
              <Building2 className="h-8 w-8 mb-4 text-purple-300" />
              <h3 className="text-2xl sm:text-3xl font-black mb-2.5">Dành cho nhà tuyển dụng</h3>
              <p className="text-purple-200 text-sm sm:text-base mb-8 max-w-md">
                Đăng tin tuyển dụng và tự động sàng lọc hồ sơ bằng AI.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-xl gap-2 cursor-pointer shadow-sm h-11 px-6"
              >
                <Link to="/employer/register">
                  Đăng tin tuyển dụng <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
