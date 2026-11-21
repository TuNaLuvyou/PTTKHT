import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight } from "lucide-react";

const SAMPLE_POSTS = [
  { id: 1, title: "Senior Frontend Developer", company: "TechCorp Vietnam", location: "TP. HCM", type: "Toàn thời gian", level: "Senior", applications: 24 },
  { id: 2, title: "Product Manager", company: "StartupXYZ", location: "Remote", type: "Toàn thời gian", level: "Middle", applications: 18 },
  { id: 3, title: "UI/UX Designer", company: "Creative Agency", location: "Hà Nội", type: "Toàn thời gian", level: "Junior", applications: 9 },
  { id: 4, title: "Data Analyst", company: "FinTech Co.", location: "TP. HCM", type: "Toàn thời gian", level: "Junior", applications: 31 },
  { id: 5, title: "DevOps Engineer", company: "CloudSys", location: "Remote", type: "Toàn thời gian", level: "Senior", applications: 7 },
  { id: 6, title: "Backend Developer", company: "E-commerce Ltd", location: "TP. HCM", type: "Toàn thời gian", level: "Middle", applications: 15 },
];

export function RecentJobPostsSection() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-20 sm:py-28 bg-[#F8FAFC]">
      <div className="container-app">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] [text-wrap:balance]">
            Vị trí tuyển dụng sôi động
          </h2>

          <Button
            variant="ghost"
            onClick={() => navigate(isAuthenticated ? "/employer/jobs/new" : "/employer/register")}
            className="text-[#7C3AED] hover:bg-purple-50 font-semibold rounded-xl gap-1.5 text-sm cursor-pointer p-0 hover:p-2 transition-all"
          >
            <span>Đăng tin mới</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {SAMPLE_POSTS.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
              onClick={() => navigate(isAuthenticated ? "/employer/jobs" : "/employer/register")}
            >
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-purple-50 text-[#7C3AED] font-black text-sm flex items-center justify-center shrink-0">
                    {job.company.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#7C3AED] transition-colors truncate">
                      {job.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">{job.company}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mb-4">
                  <span className="text-[11px] text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg font-medium">
                    {job.location}
                  </span>
                  <span className="text-[11px] text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg font-semibold">
                    {job.level}
                  </span>
                  <span className="text-[11px] text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg font-medium">
                    {job.type}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-50">
                <span>{job.applications} hồ sơ đã nộp</span>
                <span className="text-[#7C3AED] font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Xem chi tiết
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
