import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  ArrowRight,
  FileText,
  Briefcase,
  Building2,
  CheckCircle2,
  TrendingUp,
  Monitor,
  Palette,
  Megaphone,
  Wallet,
  Users,
  Bot,
  FolderKanban,
  Settings,
  HeartPulse,
  Newspaper,
  BookOpen,
  Ship,
  Folder,
} from "lucide-react";
import EmptyState from "@/components/common/EmptyState";
import { SkeletonJobCard } from "@/components/common/Skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import JobCard from "@/components/common/JobCard";

const CATEGORY_ICON_MAP = {
  monitor: Monitor,
  palette: Palette,
  megaphone: Megaphone,
  wallet: Wallet,
  users: Users,
  "trending-up": TrendingUp,
  bot: Bot,
  "folder-kanban": FolderKanban,
  settings: Settings,
  building2: Building2,
  "heart-pulse": HeartPulse,
  newspaper: Newspaper,
  "book-open": BookOpen,
  ship: Ship,
  folder: Folder,
};

const STATS = [
  { value: "50,000+", label: "CV đã phân tích", icon: FileText },
  { value: "12,000+", label: "Việc làm đang tuyển", icon: Briefcase },
  { value: "3,500+", label: "Công ty tuyển dụng", icon: Building2 },
  { value: "95%", label: "Tỷ lệ hài lòng", icon: CheckCircle2 },
];

export function HeroSection() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (keyword.trim()) p.set("keyword", keyword.trim());
    if (location.trim()) p.set("location", location.trim());
    navigate(`/jobs?${p}`);
  };

  return (
    <section className="relative bg-[#0F172A] overflow-hidden pt-20 pb-16 lg:pt-28 lg:pb-24 text-white">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-140 h-140 rounded-full bg-[#1549B8]/25 blur-[120px]" />
      </div>

      <div className="container-app relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12 lg:mb-16">
          {/* Left Column: Heading + Search */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black leading-[1.14] tracking-tight mb-4 text-white">
              Tìm việc chuẩn ATS
              <br />
              <span className="bg-linear-to-r from-blue-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
                nhanh hơn cùng AI
              </span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base lg:text-lg mb-8 max-w-lg leading-relaxed">
              Tạo CV chuẩn ATS và kết nối 12,000+ việc làm chất lượng.
            </p>

            {/* Search form */}
            <form
              onSubmit={handleSearch}
              className="w-full max-w-xl bg-white p-2.5 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-2 mb-4"
            >
              <div className="flex-1 flex items-center gap-2.5 px-3 py-1.5">
                <Search className="h-5 w-5 text-slate-400 shrink-0" />
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Vị trí, kỹ năng, công ty..."
                  className="border-0 shadow-none focus-visible:ring-0 p-0 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent rounded-none h-auto"
                />
              </div>

              <Separator orientation="vertical" className="hidden sm:block h-8 self-center bg-slate-200" />

              <div className="flex items-center gap-2 px-3 py-1.5 sm:w-36">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Địa điểm"
                  className="border-0 shadow-none focus-visible:ring-0 p-0 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent rounded-none h-auto"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="bg-[#1549B8] hover:bg-[#1240A0] text-white font-bold h-11 px-6 rounded-xl shrink-0 cursor-pointer text-sm"
              >
                Tìm việc
              </Button>
            </form>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400">Gợi ý:</span>
              {["Frontend", "NodeJS", "UI/UX", "Data Analyst", "Product Manager"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(tag)}`)}
                  className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Score Mockup */}
          <div className="lg:col-span-5 relative">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 mb-5">
                <div>
                  <h3 className="font-bold text-sm text-white">Nguyễn Hoàng Nam</h3>
                  <p className="text-xs text-slate-400">Frontend Developer</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                  Chuẩn ATS
                </span>
              </div>

              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-400/80 bg-emerald-500/10 flex flex-col items-center justify-center shrink-0">
                  <span className="text-xl font-black text-white">94</span>
                  <span className="text-[8px] uppercase font-bold text-slate-400">ATS</span>
                </div>

                <div className="flex-1 space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Từ khóa JD</span>
                      <span className="font-bold text-white">96%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "96%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Định dạng</span>
                      <span className="font-bold text-white">92%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: "92%" }} />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => navigate("/cv-upload")}
                className="w-full bg-[#1549B8] hover:bg-[#1240A0] text-white font-bold h-11 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-sm shadow-sm"
              >
                <span>Chấm điểm CV miễn phí</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="border-t border-slate-800/80 pt-8 pb-2 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s, idx) => {
            const StatIcon = s.icon;
            return (
              <div key={idx} className="flex items-center gap-3">
                <StatIcon className="h-5 w-5 text-blue-300 shrink-0" />
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white">{s.value}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function CategoriesSection({ categories, onCategoryClick }) {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#F8FAFC]">
      <div className="container-app">
        <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] mb-8 sm:mb-10 text-center">
          Ngành nghề nổi bật
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {categories.slice(0, 8).map((cat) => {
            const CatIcon = CATEGORY_ICON_MAP[cat.icon] || Folder;
            return (
              <button
                key={cat.id || cat.name}
                onClick={() => onCategoryClick(cat.name)}
                className="flex items-center gap-3.5 p-4 sm:p-5 bg-white rounded-2xl shadow-xs hover:shadow-md transition-all text-left cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50 group-hover:bg-[#1549B8] flex items-center justify-center transition-colors shrink-0">
                  <CatIcon className="h-5 w-5 text-[#1549B8] group-hover:text-white transition-colors" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm sm:text-base text-[#0F172A] group-hover:text-[#1549B8] transition-colors truncate">
                    {cat.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {(cat.count || 0).toLocaleString()} việc
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function FeaturedJobsSection({ jobs, loading }) {
  const navigate = useNavigate();

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="container-app">
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] mb-1">
              Việc làm mới nhất
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Cơ hội việc làm tuyển gấp từ các doanh nghiệp hàng đầu
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/jobs")}
            className="text-[#1549B8] hover:bg-blue-50 font-bold rounded-xl gap-1 text-sm cursor-pointer"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map((i) => <SkeletonJobCard key={i} />)
          ) : jobs.length === 0 ? (
            <EmptyState icon={Briefcase} title="Chưa có việc làm nào" className="col-span-full py-12" />
          ) : (
            jobs.map((job, i) => <JobCard key={job.id} job={job} index={i} />)
          )}
        </div>
      </div>
    </section>
  );
}
