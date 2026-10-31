import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { BarChart3, Rocket, Plus } from "lucide-react";

export function CTASection() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <section className="section bg-white">
      <div className="container-app">
        <div className="text-center p-8 sm:p-12 bg-linear-to-br from-[#1E1B4B] via-[#4C1D95] to-[#7C3AED] rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 leading-tight">
              Tìm kiếm nhân tài cùng NexCV
            </h2>
            <p className="text-purple-100 text-sm sm:text-base mb-6">
              Kết nối hơn 50,000+ ứng viên chất lượng và rút ngắn quy trình tuyển dụng.
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                size="lg"
                onClick={() => navigate(isAuthenticated ? "/employer/dashboard" : "/employer/register")}
                className="bg-white hover:bg-slate-100 text-[#7C3AED] font-bold h-11 px-6 rounded-xl shadow-md cursor-pointer transition-all active:scale-[0.99]"
              >
                {isAuthenticated ? (
                  <>
                    <BarChart3 className="h-4 w-4 mr-1.5" />
                    <span>Vào Dashboard</span>
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-1.5" />
                    <span>Đăng ký tuyển dụng miễn phí</span>
                  </>
                )}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate(isAuthenticated ? "/employer/jobs/new" : "/employer/register")}
                className="border-white/30 text-white bg-white/10 hover:bg-white/20 hover:text-white font-semibold h-11 px-5 rounded-xl cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                <span>Đăng tin ngay</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
