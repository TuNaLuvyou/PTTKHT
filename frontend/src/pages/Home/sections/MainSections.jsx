import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Sparkles, ArrowRight, FileText, Briefcase, Building2, Star, Monitor, Palette, Megaphone, Wallet, Users, TrendingUp, Bot, FolderKanban, Settings, HeartPulse, Newspaper, BookOpen, Ship, Folder } from "lucide-react";
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonJobCard } from '@/components/ui/Skeleton'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { JOB_CATEGORIES } from "@/services/jobService";
import JobCard from "@/components/JobCard";

const CATEGORY_ICON_MAP = {
  monitor: Monitor,
  palette: Palette,
  megaphone: Megaphone,
  wallet: Wallet,
  users: Users,
  'trending-up': TrendingUp,
  bot: Bot,
  'folder-kanban': FolderKanban,
  settings: Settings,
  building2: Building2,
  'heart-pulse': HeartPulse,
  newspaper: Newspaper,
  'book-open': BookOpen,
  ship: Ship,
  folder: Folder,
}

const STATS = [
  { value: "50,000+", label: "CV đã phân tích", icon: FileText },
  { value: "12,000+", label: "Việc làm đang tuyển", icon: Briefcase },
  { value: "3,500+", label: "Công ty đối tác", icon: Building2 },
  { value: "95%", label: "Tỷ lệ hài lòng", icon: Star },
];

export function HeroSection() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (keyword) p.set("keyword", keyword);
    if (location) p.set("location", location);
    navigate(`/jobs?${p}`);
  };

  return (
    <section className="relative bg-linear-to-br from-[#0F172A] via-[#1E3A6E] to-[#1549B8] overflow-hidden pt-20 pb-0">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-125 h-125 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-100 h-100 rounded-full bg-[#1549B8]/30 blur-3xl" />
        <svg className="absolute right-10 top-20 opacity-10" width="200" height="200" viewBox="0 0 200 200">
          {Array.from({ length: 6 }).flatMap((_, r) =>
            Array.from({ length: 6 }).map((_, c) => (
              <circle key={`${r}${c}`} cx={c * 35 + 10} cy={r * 35 + 10} r="2.5" fill="white" />
            )),
          )}
        </svg>
      </div>

      <div className="container-app relative pt-12 pb-0">
        <div className="inline-flex items-center gap-1.5 bg-violet-500/20 border border-violet-400/30 rounded-full px-3 py-1.5 mb-5">
          <Sparkles className="h-3.5 w-3.5 text-violet-300" />
          <span className="text-xs font-medium text-violet-200">Tích hợp AI phân tích CV thông minh</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-[56px] font-black text-white leading-[1.1] mb-5 max-w-3xl">
          Tìm việc làm mơ ước
          <br />
          <span className="bg-linear-to-r from-blue-300 to-violet-400 bg-clip-text text-transparent">với sức mạnh AI</span>
        </h1>
        <p className="text-slate-300 text-base md:text-lg mb-8 max-w-130 leading-relaxed">
          Upload CV và nhận đánh giá chi tiết từ AI trong 30 giây. Khám phá hàng nghìn cơ hội từ các công ty hàng đầu Việt Nam.
        </p>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row bg-white rounded-2xl p-2 shadow-2xl max-w-2xl mb-5 gap-2 sm:gap-0">
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5">
            <Search className="h-4 w-4 text-[#94A3B8] shrink-0" />
            <Input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Tên công việc, kỹ năng, công ty..."
              className="border-0 shadow-none focus-visible:ring-0 p-0 text-sm text-[#0F172A] placeholder:text-[#94A3B8] bg-transparent focus:bg-transparent rounded-none h-auto" />
          </div>
          <Separator orientation="vertical" className="hidden sm:block h-8 self-center mx-1" />
          <div className="flex items-center gap-2 px-3 py-1.5">
            <MapPin className="h-4 w-4 text-[#94A3B8] shrink-0" />
            <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Địa điểm"
              className="border-0 shadow-none focus-visible:ring-0 p-0 text-sm text-[#0F172A] placeholder:text-[#94A3B8] w-full sm:w-36 bg-transparent focus:bg-transparent rounded-none h-auto" />
          </div>
          <Button type="submit" size="lg" className="rounded-xl sm:ml-1 bg-[#1549B8] hover:bg-[#1240A0] text-white font-bold shrink-0 sm:w-auto">Tìm kiếm</Button>
        </form>

        <div className="flex flex-wrap gap-2 items-center mb-10">
          <span className="text-slate-400 text-sm">Phổ biến:</span>
          {["React Developer", "UI/UX Designer", "Data Analyst", "Product Manager", "DevOps"].map(tag => (
            <button key={tag} onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(tag)}`)}
              className="text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 transition-colors cursor-pointer">
              {tag}
            </button>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 pb-10 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {STATS.map(s => {
            const StatIcon = s.icon
            return (
            <div key={s.value} className="flex items-center gap-3">
              <StatIcon size={24} className="text-blue-300" />
              <div>
                <div className="text-xl md:text-2xl font-black text-white">{s.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
              </div>
            </div>
          )
          })}
        </div>
      </div>
    </section>
  );
}

export function CategoriesSection({ categories, onCategoryClick }) {
  return (
    <section className="section bg-[#F8FAFC] border-t border-[#F1F5F9]">
      <div className="container-app">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] mb-2">Khám phá theo ngành nghề</h2>
          <p className="text-[#475569]">Hàng nghìn công việc trong tất cả lĩnh vực</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map(cat => {
            const CatIcon = CATEGORY_ICON_MAP[cat.icon] || Folder
            return (
            <button key={cat.id || cat.name} onClick={() => onCategoryClick(cat.name)}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#E2E8F0] hover:-translate-y-1 hover:shadow-md hover:border-[#1549B8]/30 transition-all duration-200 text-left cursor-pointer">
              <CatIcon size={24} className="text-[#1549B8]" />
              <div>
                <div className="font-semibold text-sm text-[#0F172A]">{cat.name}</div>
                <div className="text-xs text-[#94A3B8] mt-0.5">{(cat.count || 0).toLocaleString()} việc</div>
              </div>
            </button>
          )
          })}
        </div>
      </div>
    </section>
  );
}

export function FeaturedJobsSection({ jobs, loading }) {
  return (
    <section className="section bg-white border-t border-[#F1F5F9]">
      <div className="container-app">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] mb-1">Việc làm mới nhất</h2>
            <p className="text-[#475569]">Cập nhật mỗi ngày từ các công ty hàng đầu</p>
          </div>
          <Button variant="ghost" asChild className="gap-1 text-[#1549B8] hover:text-[#1549B8] hover:bg-[#EEF2FF]">
            <a href="/jobs">Xem tất cả <ArrowRight className="h-4 w-4" /></a>
          </Button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map(i => <SkeletonJobCard key={i} />)
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="Chưa có công việc nào mới nhất"
              className="col-span-full bg-transparent border-none"
            />
          ) : (
            jobs.map((job, i) => <JobCard key={job.id} job={job} index={i} />)
          )}
        </div>
      </div>
    </section>
  );
}
