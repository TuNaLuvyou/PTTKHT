import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Plus } from "lucide-react";

export function CTASection() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-20 sm:py-28 bg-[#F8FAFC]">
      <div className="container-app">
        <div className="bg-[#1E1B4B] rounded-3xl p-8 sm:p-14 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 leading-tight tracking-tight [text-wrap:balance]">
              Tìm kiếm nhân tài cùng tiêu chuẩn ATS.
            </h2>
            <p className="text-purple-200 text-sm sm:text-base leading-relaxed [text-wrap:pretty]">
              Đăng tin tuyển dụng và tiếp cận ứng viên chất lượng cao ngay hôm nay.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Button
              onClick={() => navigate(isAuthenticated ? "/employer/dashboard" : "/employer/register")}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold h-12 px-7 rounded-xl shadow-none cursor-pointer"
            >
              <span>{isAuthenticated ? "Vào Dashboard" : "Đăng ký tuyển dụng"}</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(isAuthenticated ? "/employer/jobs/new" : "/employer/register")}
              className="border-purple-300/40 text-white bg-transparent hover:bg-white/10 font-semibold h-12 px-6 rounded-xl cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              <span>Đăng tin ngay</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
