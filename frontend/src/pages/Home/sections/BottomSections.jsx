import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ATSShowcaseSection({ onCreateCV }) {
  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="container-app">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Heading, Subline, Actions */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight leading-[1.12] mb-5 [text-wrap:balance]">
              Đo lường độ tương thích ATS trong giây lát.
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mb-8 max-w-lg leading-relaxed [text-wrap:pretty]">
              Hệ thống tự động rà soát từ khóa, bố cục và định dạng hồ sơ theo tiêu chuẩn của các hệ thống tuyển dụng tự động.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="bg-[#1549B8] hover:bg-[#1240A0] text-white font-semibold h-12 px-7 rounded-xl shadow-none cursor-pointer"
              >
                <Link to="/cv-upload" className="inline-flex items-center gap-2">
                  <span>Tải CV kiểm tra</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCreateCV}
                className="border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold h-12 px-7 rounded-xl cursor-pointer"
              >
                Tạo CV mới
              </Button>
            </div>
          </div>

          {/* Right Column: Clean ATS Checklist */}
          <div className="lg:col-span-6">
            <div className="bg-[#F8FAFC] rounded-3xl p-8 sm:p-10 space-y-7">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-[#1549B8] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-base text-slate-900 mb-1">
                    Tương thích hệ thống quét ATS
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Đảm bảo font chữ, phân đoạn tiêu đề và định dạng file không bị lỗi đọc khi xử lý tự động.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-[#1549B8] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-base text-slate-900 mb-1">
                    Độ khớp từ khóa chuyên môn
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Đối chiếu và đo lường tỷ lệ trùng khớp giữa kỹ năng trong CV với yêu cầu thực tế của JD.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-[#1549B8] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-base text-slate-900 mb-1">
                    Cấu trúc hồ sơ chuẩn hóa
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Sắp xếp mục tiêu, kinh nghiệm và kỹ năng theo trình tự ưu tiên tiêu chuẩn quốc tế.
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

export function CTASplitSection({ onCreateCV }) {
  return (
    <section className="py-20 sm:py-28 bg-[#F8FAFC]">
      <div className="container-app">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          {/* Candidate Card - Royal Blue Theme */}
          <div className="bg-[#0F172A] rounded-3xl p-8 sm:p-12 text-white flex flex-col justify-between min-h-[240px]">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">
                Dành cho ứng viên
              </h3>
              <p className="text-slate-300 text-sm sm:text-base mb-8 max-w-md leading-relaxed">
                Tạo CV chuẩn ATS và kết nối trực tiếp với các cơ hội việc làm chất lượng.
              </p>
            </div>
            <div>
              <Button
                onClick={onCreateCV}
                className="bg-[#1549B8] hover:bg-[#1240A0] text-white font-semibold rounded-xl h-12 px-6 inline-flex items-center gap-2 cursor-pointer shadow-none"
              >
                <FileEdit className="h-4 w-4" />
                <span>Tạo CV ngay</span>
              </Button>
            </div>
          </div>

          {/* Employer Card - Violet/Purple Theme */}
          <div className="bg-[#1E1B4B] rounded-3xl p-8 sm:p-12 text-white flex flex-col justify-between min-h-[240px]">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">
                Dành cho nhà tuyển dụng
              </h3>
              <p className="text-slate-300 text-sm sm:text-base mb-8 max-w-md leading-relaxed">
                Đăng tin tuyển dụng và tiếp cận ứng viên tiềm năng đã được sàng lọc.
              </p>
            </div>
            <div>
              <Button
                asChild
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-xl h-12 px-6 inline-flex items-center gap-2 cursor-pointer shadow-none"
              >
                <Link to="/employer/register">
                  <span>Đăng tin tuyển dụng</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
