import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Plus, MapPin, Briefcase, BarChart3, Clock, Users } from "lucide-react";

const SAMPLE_POSTS = [
  { id: 1, title: "Senior Frontend Developer", company: "TechCorp Vietnam", location: "TP. HCM", type: "Toàn thời gian", level: "Senior", applications: 24, postedDays: 1 },
  { id: 2, title: "Product Manager", company: "StartupXYZ", location: "Từ xa", type: "Toàn thời gian", level: "Middle", applications: 18, postedDays: 3 },
  { id: 3, title: "UI/UX Designer", company: "Creative Agency", location: "Hà Nội", type: "Bán thời gian", level: "Junior", applications: 9, postedDays: 5 },
  { id: 4, title: "Data Analyst", company: "FinTech Co.", location: "TP. HCM", type: "Toàn thời gian", level: "Junior", applications: 31, postedDays: 2 },
  { id: 5, title: "DevOps Engineer", company: "CloudSys", location: "Từ xa", type: "Toàn thời gian", level: "Senior", applications: 7, postedDays: 0 },
  { id: 6, title: "Backend Developer", company: "E-commerce Ltd", location: "TP. HCM", type: "Toàn thời gian", level: "Middle", applications: 15, postedDays: 4 },
];

export function RecentJobPostsSection() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <section className="section bg-[#F8FAFC]">
      <div className="container-app">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] mb-1">
              Vị trí đang tuyển sôi động
            </h2>
            <p className="text-slate-500 text-sm">
              Các vị trí thu hút nhiều ứng viên tiềm năng nộp hồ sơ
            </p>
          </div>

          <Button
            size="lg"
            onClick={() => navigate(isAuthenticated ? "/employer/jobs/new" : "/employer/register")}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-xl gap-2 h-10 px-5 shadow-sm cursor-pointer shrink-0 text-sm"
          >
            <Plus size={16} />
            <span>Đăng tin tuyển dụng</span>
          </Button>
        </div>

        {/* Jobs Grid: rounded-2xl, NO divider lines inside */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-sm sm:text-base text-[#0F172A] group-hover:text-[#7C3AED] transition-colors truncate">
                        {job.title}
                      </h3>
                      <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        Đang tuyển
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">{job.company}</p>
                  </div>
                </div>

                {/* Info badges without border lines */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                    <Briefcase className="h-3 w-3 text-slate-400" />
                    {job.type}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#7C3AED] bg-purple-50 px-2 py-0.5 rounded-md font-semibold">
                    <BarChart3 className="h-3 w-3" />
                    {job.level}
                  </span>
                </div>
              </div>

              {/* Card footer: No divider line, subtle spacing */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {job.postedDays === 0 ? "Hôm nay" : `${job.postedDays} ngày trước`}
                </span>
                <span className="font-semibold text-slate-600 flex items-center gap-1">
                  <Users className="h-3 w-3 text-slate-400" />
                  {job.applications} hồ sơ
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
