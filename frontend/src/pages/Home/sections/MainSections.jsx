import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  ArrowRight,
  Briefcase,
} from "lucide-react";
import EmptyState from "@/components/common/EmptyState";
import { SkeletonJobCard } from "@/components/common/Skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import JobCard from "@/components/common/JobCard";

export function HeroSection() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (keyword.trim()) p.set("keyword", keyword.trim());
    if (location.trim()) p.set("location", location.trim());
    navigate(`/jobs?${p.toString()}`);
  };

  const handleSuggestion = (tag) => {
    navigate(`/jobs?keyword=${encodeURIComponent(tag)}`);
  };

  return (
    <section className="bg-[#0F172A] text-white pt-28 pb-20 sm:pt-36 sm:pb-28 lg:pt-40 lg:pb-32">
      <div className="container-app">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Heading, Subline, Search Form */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white mb-5 [text-wrap:balance]">
              Tìm việc chuẩn ATS.
            </h1>
            <p className="text-slate-300 text-base sm:text-lg mb-8 max-w-xl leading-relaxed [text-wrap:pretty]">
              Tối ưu hồ sơ theo tiêu chuẩn hệ thống tuyển dụng tự động và kết nối việc làm phù hợp.
            </p>

            {/* Clean search bar */}
            <form
              onSubmit={handleSearch}
              className="w-full max-w-xl bg-white p-2 rounded-2xl flex flex-col sm:flex-row gap-2 shadow-2xl mb-5"
            >
              <div className="flex-1 flex items-center gap-3 px-3.5 py-2">
                <Search className="h-5 w-5 text-slate-400 shrink-0" />
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Vị trí, kỹ năng, công ty..."
                  className="border-0 shadow-none focus-visible:ring-0 p-0 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent rounded-none h-auto"
                />
              </div>

              <div className="flex items-center gap-2.5 px-3.5 py-2 sm:w-40 sm:border-l sm:border-slate-100">
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
                className="bg-[#1549B8] hover:bg-[#1240A0] text-white font-semibold h-11 px-6 rounded-xl shrink-0 cursor-pointer text-sm"
              >
                Tìm việc
              </Button>
            </form>

            {/* Quiet, text-only search suggestions */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
              <span className="text-slate-500">Gợi ý:</span>
              {["Frontend", "NodeJS", "UI/UX", "Data Analyst", "Product Manager"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleSuggestion(tag)}
                  className="hover:text-white transition-colors cursor-pointer underline-offset-4 hover:underline"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: ATS Diagnostic Preview */}
          <div className="lg:col-span-5">
            <div className="bg-[#162032] rounded-3xl p-6 sm:p-8 text-white shadow-xl">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800/80">
                <div>
                  <h3 className="font-semibold text-base text-white">Chẩn đoán hồ sơ ATS</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Tiêu chuẩn tuyển dụng tự động</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-400 tabular-nums">94</span>
                  <span className="text-xs text-slate-400 ml-1">/100</span>
                </div>
              </div>

              <div className="space-y-4 mb-7 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                  <span className="text-slate-300">Độ khớp từ khóa JD</span>
                  <span className="font-semibold text-white tabular-nums">96%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                  <span className="text-slate-300">Định dạng & Font chữ</span>
                  <span className="font-semibold text-emerald-400">Đạt chuẩn</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-300">Bố cục mục tiêu & kinh nghiệm</span>
                  <span className="font-semibold text-emerald-400">Tối ưu</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => navigate("/cv-upload")}
                className="w-full bg-[#1549B8] hover:bg-[#1240A0] text-white font-semibold h-11 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <span>Kiểm tra CV của bạn</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CategoriesSection({ categories, onCategoryClick }) {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="container-app">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] mb-10 [text-wrap:balance]">
          Ngành nghề tuyển dụng
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.slice(0, 8).map((cat) => (
            <button
              key={cat.id || cat.name}
              type="button"
              onClick={() => onCategoryClick(cat.name)}
              className="p-4 sm:p-5 rounded-2xl hover:bg-slate-50 transition-colors text-left cursor-pointer group flex items-center justify-between"
            >
              <div className="min-w-0 pr-3">
                <div className="font-semibold text-sm sm:text-base text-slate-900 group-hover:text-[#1549B8] transition-colors truncate">
                  {cat.name}
                </div>
                <div className="text-xs text-slate-400 mt-1 tabular-nums">
                  {(cat.count || 0).toLocaleString()} việc làm
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#1549B8] group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedJobsSection({ jobs, loading }) {
  const navigate = useNavigate();

  return (
    <section className="py-20 sm:py-28 bg-[#F8FAFC]">
      <div className="container-app">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] [text-wrap:balance]">
            Việc làm mới nhất
          </h2>
          <Button
            variant="ghost"
            onClick={() => navigate("/jobs")}
            className="text-[#1549B8] hover:bg-blue-50 font-semibold rounded-xl gap-1.5 text-sm cursor-pointer p-0 hover:p-2 transition-all"
          >
            <span>Xem tất cả việc làm</span>
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
