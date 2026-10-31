import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  MapPin,
  Briefcase,
  Layers,
  Check,
} from "lucide-react";
import { SkeletonJobCard } from "@/components/common/Skeleton";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import JobCard from "@/components/common/JobCard";
import { jobService, JOB_CATEGORIES } from "@/services/jobService";
import { cn } from "@/lib/utils";

const LIMIT = 10;
const LEVELS = ["Intern", "Junior", "Middle", "Senior", "Lead/Manager"];
const JOB_TYPES = ["Toàn thời gian", "Bán thời gian", "Remote", "Freelance"];
const LOCATIONS = ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ"];

function Sidebar({ filters, onChange, mobile, onClose }) {
  const hasFilters = ["category", "level", "type", "location"].some((k) => filters[k]);
  const toggle = (key, val) =>
    onChange({ ...filters, [key]: filters[key] === val ? "" : val });

  const Group = ({ title, items, fkey, icon: IconComp }) => (
    <div className="mb-6">
      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
        {IconComp && <IconComp className="h-3.5 w-3.5 text-[#1549B8]" />}
        <span>{title}</span>
      </p>
      <div className="space-y-1">
        {items.map((item) => {
          const val = typeof item === "string" ? item : item.name;
          const active = filters[fkey] === val;
          return (
            <label
              key={val}
              htmlFor={"filter-" + fkey + "-" + val.replace(/\s+/g, "-")}
              className={cn(
                "flex items-center gap-2.5 py-1.5 px-2.5 rounded-xl cursor-pointer transition-colors group text-sm",
                active
                  ? "bg-blue-50 text-[#1549B8] font-bold"
                  : "hover:bg-slate-100 text-slate-600"
              )}
              onClick={(e) => {
                e.preventDefault();
                toggle(fkey, val);
              }}
            >
              <input
                id={"filter-" + fkey + "-" + val.replace(/\s+/g, "-")}
                type="radio"
                name={"filter-" + fkey}
                checked={active}
                onChange={() => toggle(fkey, val)}
                className="sr-only"
                aria-label={val}
              />
              <div
                className={cn(
                  "w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0",
                  active
                    ? "border-[#1549B8] bg-[#1549B8] text-white"
                    : "border-slate-300 bg-white group-hover:border-[#1549B8]"
                )}
              >
                {active && <Check className="h-3 w-3 stroke-[3]" />}
              </div>
              <span className="flex-1 truncate">{val}</span>
              {typeof item !== "string" && item.count && (
                <span className="text-[11px] text-slate-400 font-medium">
                  {item.count}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside
      className={cn(
        mobile ? "fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex" : "hidden lg:block w-60 shrink-0"
      )}
      onClick={mobile ? onClose : undefined}
    >
      <div
        className={cn(
          mobile
            ? "w-80 bg-white h-full overflow-y-auto p-5"
            : "bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 sticky top-24"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 font-bold text-sm text-[#0F172A]">
            <Filter className="h-4 w-4 text-[#1549B8]" />
            <span>Bộ lọc</span>
          </div>
          {hasFilters && (
            <button
              onClick={() =>
                onChange({ ...filters, category: "", level: "", type: "", location: "" })
              }
              className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <X className="h-3 w-3" />
              <span>Xóa lọc</span>
            </button>
          )}
          {mobile && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-slate-400 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Filter Groups */}
        <Group title="Địa điểm" items={LOCATIONS} fkey="location" icon={MapPin} />
        <Group title="Ngành nghề" items={JOB_CATEGORIES} fkey="category" icon={Layers} />
        <Group title="Cấp bậc" items={LEVELS} fkey="level" icon={Briefcase} />
        <Group title="Hình thức" items={JOB_TYPES} fkey="type" />
      </div>
    </aside>
  );
}

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const [currentPage, setCurrentPage] = useState(pageParam > 0 ? pageParam : 1);
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [sort, setSort] = useState("newest");
  const [searchInput, setSearchInput] = useState(searchParams.get("keyword") || "");
  const [filters, setFilters] = useState({
    keyword: searchParams.get("keyword") || "",
    category: searchParams.get("category") || "",
    level: "",
    type: "",
    location: searchParams.get("location") || "",
  });

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => {
        if (prev.keyword === searchInput) return prev;
        setCurrentPage(1);
        return { ...prev, keyword: searchInput };
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await jobService.getJobs({
        ...filters,
        sort,
        page: currentPage,
        limit: LIMIT,
      });
      setJobs(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, sort, currentPage]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", "1");
      return next;
    }, { replace: true });
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setCurrentPage(1);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", "1");
      return next;
    }, { replace: true });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(newPage));
      return next;
    });
    // Smooth scroll back to jobs list
    window.scrollTo({ top: 280, behavior: "smooth" });
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const removeFilter = (key) => {
    handleFilterChange({ ...filters, [key]: "" });
  };

  const activeFilterList = Object.entries(filters).filter(
    ([k, v]) => Boolean(v) && k !== "keyword"
  );

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 font-sans">
      {/* Top Search Banner */}
      <div className="bg-[#0F172A] text-white pt-10 pb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1549B8]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="container-app relative z-10">
          <div className="max-w-2xl mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
              Khám Phá Việc Làm Phù Hợp
            </h1>
            <p className="text-slate-300 text-sm">
              Tìm kiếm hơn 12,000+ vị trí tuyển dụng cập nhật liên tục
            </p>
          </div>

          {/* Search Form: rounded-2xl, clean */}
          <form
            onSubmit={handleSearch}
            className="w-full bg-white p-2 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-2 max-w-3xl"
          >
            <div className="flex-1 flex items-center gap-2.5 px-3 py-1.5">
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tên công việc, kỹ năng, công ty..."
                className="border-0 shadow-none focus-visible:ring-0 p-0 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent rounded-none h-auto"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMobileFilter(true)}
                className="lg:hidden flex items-center justify-center h-11 px-3.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              >
                <SlidersHorizontal className="h-4 w-4 mr-1.5" />
                <span className="text-xs font-bold">Lọc</span>
              </button>

              <Button
                type="submit"
                size="lg"
                className="bg-[#1549B8] hover:bg-[#1240A0] text-white font-bold h-11 px-6 rounded-xl shadow-sm shrink-0 cursor-pointer"
              >
                Tìm việc
              </Button>
            </div>
          </form>

          {/* Active Filter Tags */}
          {activeFilterList.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-xs text-slate-400 font-medium">Đang lọc:</span>
              {activeFilterList.map(([key, val]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium backdrop-blur-xs"
                >
                  <span>{val}</span>
                  <button
                    type="button"
                    onClick={() => removeFilter(key)}
                    className="hover:text-rose-300 transition-colors cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={() =>
                  handleFilterChange({ keyword: "", category: "", level: "", type: "", location: "" })
                }
                className="text-xs text-blue-300 hover:underline font-semibold cursor-pointer ml-1"
              >
                Xóa tất cả
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container-app py-8">
        <div className="flex gap-6 items-start">
          {/* Desktop Filter Sidebar */}
          <Sidebar filters={filters} onChange={handleFilterChange} />

          {/* Mobile filter drawer */}
          {showMobileFilter && (
            <Sidebar
              filters={filters}
              onChange={handleFilterChange}
              mobile
              onClose={() => setShowMobileFilter(false)}
            />
          )}

          {/* Results List */}
          <div className="flex-1 min-w-0">
            {/* Header: Result count + Sort */}
            <div className="flex items-center justify-between mb-5 bg-white p-3.5 sm:p-4 rounded-2xl shadow-xs border border-slate-200/80">
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {loading ? (
                  "Đang tải việc làm..."
                ) : (
                  <>
                    Tìm thấy <span className="font-bold text-[#0F172A]">{total}</span> việc làm
                    {totalPages > 1 && (
                      <span className="text-slate-400 font-normal"> (Trang {currentPage}/{totalPages})</span>
                    )}
                    {filters.keyword && (
                      <span className="text-[#1549B8]"> cho "{filters.keyword}"</span>
                    )}
                  </>
                )}
              </p>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 hidden sm:inline">Sắp xếp:</span>
                <Select value={sort} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-36 h-9 text-xs rounded-xl border-slate-200 font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="newest">Mới nhất</SelectItem>
                    <SelectItem value="salary">Lương cao nhất</SelectItem>
                    <SelectItem value="relevant">Phù hợp nhất</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Jobs Grid (Max 10 jobs per page) */}
            {loading ? (
              <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <SkeletonJobCard key={i} />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <EmptyState
                icon={Search}
                title="Không tìm thấy việc làm phù hợp"
                description="Hãy thử thay đổi từ khóa hoặc bỏ bớt tiêu chí lọc."
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleFilterChange({
                        keyword: "",
                        category: "",
                        level: "",
                        type: "",
                        location: "",
                      })
                    }
                    className="rounded-xl font-bold"
                  >
                    <X className="h-3.5 w-3.5 mr-1.5" /> Xóa tất cả bộ lọc
                  </Button>
                }
                className="bg-white rounded-2xl border border-slate-200/80 py-16"
              />
            ) : (
              <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
                {jobs.map((job, i) => (
                  <JobCard key={job.id} job={job} index={i} />
                ))}
              </div>
            )}

            {/* Pagination: trang 1 2 3 4 ... */}
            {!loading && totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
