import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function AIPromoSection() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="container-app">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Heading, Subline, Action */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight leading-[1.12] mb-5 [text-wrap:balance]">
              Sàng lọc và xếp hạng ứng viên chuẩn xác.
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mb-8 max-w-lg leading-relaxed [text-wrap:pretty]">
              Hệ thống tự động so khớp kỹ năng và kinh nghiệm trong CV với bản mô tả công việc, rút ngắn thời gian xem xét hồ sơ.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => navigate(isAuthenticated ? "/employer/dashboard" : "/employer/register")}
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold h-12 px-7 rounded-xl shadow-none cursor-pointer"
              >
                <span>{isAuthenticated ? "Vào Dashboard" : "Bắt đầu tuyển dụng"}</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </div>

          {/* Right Column: Clean Employer Capabilities Checklist */}
          <div className="lg:col-span-6">
            <div className="bg-[#F8FAFC] rounded-3xl p-8 sm:p-10 space-y-7">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-[#7C3AED] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-base text-slate-900 mb-1">
                    Định vị từ khóa chuyên môn theo JD
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Tự động bóc tách các kỹ năng bắt buộc và điểm cộng để chấm điểm trực quan cho từng ứng viên.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-[#7C3AED] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-base text-slate-900 mb-1">
                    Kiểm tra định dạng ATS của hồ sơ
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Phát hiện các lỗi phân tích văn bản trong CV để đảm bảo thông tin ứng viên được hiển thị chuẩn xác.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-[#7C3AED] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-base text-slate-900 mb-1">
                    Theo dõi quy trình ứng tuyển tập trung
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Quản lý danh sách ứng viên, lịch phỏng vấn và trạng thái tiếp nhận trên một màn hình duy nhất.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
