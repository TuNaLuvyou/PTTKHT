import { Building2, ClipboardList, Bot, Target } from "lucide-react";

const STEPS = [
  { num: "01", icon: Building2, title: "Đăng ký tài khoản" },
  { num: "02", icon: ClipboardList, title: "Đăng tin tuyển dụng" },
  { num: "03", icon: Bot, title: "AI chấm điểm & xếp hạng" },
  { num: "04", icon: Target, title: "Phỏng vấn ứng viên" },
];

export function HowItWorksSection() {
  return (
    <section className="section bg-[#F8FAFC]">
      <div className="container-app">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] mb-1">
            Quy trình tuyển dụng 4 bước
          </h2>
          <p className="text-slate-500 text-sm">
            Nhanh chóng, chính xác và tiết kiệm thời gian cho doanh nghiệp
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STEPS.map((step) => {
            const StepIcon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white rounded-2xl p-5 text-center shadow-xs hover:shadow-md transition-all flex flex-col items-center justify-center group"
              >
                <div className="w-12 h-12 bg-purple-50 text-[#7C3AED] rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <StepIcon size={24} />
                </div>
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  Bước {step.num}
                </div>
                <h3 className="font-bold text-[#0F172A] text-sm sm:text-base">{step.title}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
