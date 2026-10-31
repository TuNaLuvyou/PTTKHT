import { useState, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  Upload,
  FileCheck,
  FileText,
  X,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Target,
  Briefcase,
  Radar as RadarIcon,
  BarChart2,
  Lightbulb,
  Rocket,
  Lock,
  Loader2,
  MapPin,
  DollarSign,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cvService } from "@/services/cvService";
import { jobService } from "@/services/jobService";
import { cn } from "@/lib/utils";
import ScoreRing from "@/components/scoring/ScoreRing";

function ScoreResult({ result, onReset }) {
  const [fetchingJobs, setFetchingJobs] = useState(false);
  const [recommendedJobs, setRecommendedJobs] = useState(null);
  const [matchedJobs, setMatchedJobs] = useState(false);
  const [errorFetching, setErrorFetching] = useState("");

  const catColor = (pct) =>
    pct >= 80 ? "#10B981" : pct >= 65 ? "#1549B8" : pct >= 50 ? "#F59E0B" : "#EF4444";

  const chartData = (result.categories || []).map((c) => ({
    subject: c.label,
    A: c.score,
    fullMark: 100,
  }));

  // Derive keyword fallback logic if recommended_roles is empty
  let derivedKeyword = "";
  if (result.recommended_roles && result.recommended_roles.length > 0) {
    derivedKeyword = result.recommended_roles[0];
  } else {
    const categories = result.categories || [];
    const sorted = [...categories].sort((a, b) => b.score - a.score);
    if (sorted[0]) {
      if (sorted[0].key === "skills_match" && result.strengths && result.strengths.length > 0) {
        derivedKeyword = result.strengths[0];
      } else {
        derivedKeyword = sorted[0].label;
      }
    } else {
      derivedKeyword = result.level_assessment || "Developer";
    }
  }

  const rolesToSearch =
    result.recommended_roles && result.recommended_roles.length > 0
      ? result.recommended_roles
      : [derivedKeyword];

  const handleFindJobs = async () => {
    setFetchingJobs(true);
    setErrorFetching("");
    try {
      const res = await jobService.getRecommendedJobs(rolesToSearch, 5);
      setRecommendedJobs(res?.data || []);
      setMatchedJobs(res?.matched ?? false);
    } catch (err) {
      console.error(err);
      setErrorFetching("Lỗi khi tải danh sách việc làm gợi ý.");
    } finally {
      setFetchingJobs(false);
    }
  };

  const LOGO_COLORS = [
    { bg: "#EEF2FF", text: "#1549B8" },
    { bg: "#F5F3FF", text: "#7C3AED" },
    { bg: "#ECFDF5", text: "#059669" },
    { bg: "#FFF7ED", text: "#EA580C" },
    { bg: "#FEF2F2", text: "#DC2626" },
  ];

  return (
    <div className="space-y-6 w-full mx-auto">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Overall Score Card (Sticky) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          <div className="rounded-3xl bg-linear-to-br from-[#0F172A] via-[#1E3A8A] to-[#1549B8] p-7 text-white shadow-xl flex flex-col items-center text-center">
            <div className="mb-4">
              <ScoreRing score={result.overall} size={135} />
            </div>

            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-white mb-2">
              Xếp loại {result.grade} — {result.gradeLabel}
            </span>

            <h2 className="text-xl sm:text-2xl font-black text-white mb-1.5 flex items-center justify-center gap-2">
              {result.overall >= 80 ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" /> CV đạt chuẩn cao!
                </>
              ) : result.overall >= 65 ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" /> CV khá tốt, cần tối ưu thêm
                </>
              ) : (
                <>
                  <Target className="h-5 w-5 text-amber-400" /> CV cần cải thiện
                </>
              )}
            </h2>

            <p className="text-blue-200 text-xs mb-5 truncate max-w-xs px-2">
              {result.fileName}
            </p>

            {/* Strengths list - soft badges, no divider borders */}
            {result.strengths?.length > 0 && (
              <div className="w-full space-y-2 mb-2 text-left">
                {result.strengths.slice(0, 3).map((s) => (
                  <div
                    key={s}
                    className="text-xs p-2.5 rounded-xl bg-white/10 text-emerald-300 flex items-start gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
            <Button
              size="lg"
              onClick={handleFindJobs}
              disabled={fetchingJobs}
              className="w-full h-11 bg-[#1549B8] hover:bg-[#1240A0] text-white font-bold rounded-xl gap-2 justify-center cursor-pointer shadow-sm"
            >
              {fetchingJobs ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Briefcase className="h-4 w-4" />
              )}
              <span>Tìm việc làm phù hợp</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={onReset}
              className="w-full h-11 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl gap-2 justify-center border-slate-200 cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              <span>Chấm điểm CV khác</span>
            </Button>
          </div>
        </div>

        {/* Right Column: Breakdown Cards (No inner divider lines, rounded-3xl) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Visual Radar Chart */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80">
            <h3 className="font-bold text-[#0F172A] text-base sm:text-lg mb-4 flex items-center gap-2">
              <RadarIcon className="h-5 w-5 text-[#1549B8]" />
              <span>Biểu đồ tương thích</span>
            </h3>
            <div className="h-[280px] sm:h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Điểm số"
                    dataKey="A"
                    stroke="#1549B8"
                    strokeWidth={2}
                    fill="#1549B8"
                    fillOpacity={0.25}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Criteria breakdown */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80">
            <h3 className="font-bold text-[#0F172A] text-base sm:text-lg mb-5 flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-[#1549B8]" />
              <span>Điểm chi tiết theo tiêu chí</span>
            </h3>
            <div className="space-y-5">
              {(result.categories || []).map((cat) => (
                <div key={cat.key} className="bg-slate-50/70 p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-sm text-[#0F172A] flex items-center gap-1.5">
                      <span>{cat.label}</span>
                    </span>
                    <span
                      className="font-black text-sm"
                      style={{ color: catColor(cat.score) }}
                    >
                      {cat.score}/100
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-2.5">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${cat.score}%`,
                        backgroundColor: catColor(cat.score),
                      }}
                    />
                  </div>
                  {cat.feedback && (
                    <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                      {cat.feedback}
                    </p>
                  )}
                  {cat.suggestions?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {cat.suggestions.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-[#1549B8] px-2.5 py-1 rounded-lg font-medium"
                        >
                          <Lightbulb className="h-3 w-3 shrink-0" />
                          <span>{s}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Improvements */}
          {result.improvements?.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80">
              <h3 className="font-bold text-[#0F172A] text-base sm:text-lg mb-4 flex items-center gap-2">
                <Rocket className="h-5 w-5 text-[#1549B8]" />
                <span>Gợi ý cải thiện trọng tâm</span>
              </h3>
              <div className="space-y-2.5">
                {result.improvements.map((imp, i) => (
                  <div
                    key={i}
                    className="flex gap-3 items-start p-3.5 bg-amber-50/80 rounded-2xl"
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-xs font-black text-amber-800 shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      {imp}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Jobs Section */}
      {(fetchingJobs || recommendedJobs !== null) && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="font-bold text-[#0F172A] text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[#1549B8]" />
                <span>
                  {matchedJobs ? "Việc làm đề xuất phù hợp" : "Việc làm mới đang tuyển dụng"}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Gợi ý theo vị trí: "{rolesToSearch.slice(0, 3).join(", ")}"
              </p>
            </div>
            {recommendedJobs && recommendedJobs.length > 0 && (
              <Button asChild variant="outline" size="sm" className="rounded-xl font-bold">
                <Link to={`/jobs?keyword=${encodeURIComponent(derivedKeyword)}`}>
                  Xem tất cả việc làm <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </Button>
            )}
          </div>

          {fetchingJobs ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="h-8 w-8 text-[#1549B8] animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Đang tìm việc làm phù hợp...</p>
            </div>
          ) : errorFetching ? (
            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorFetching}</span>
            </div>
          ) : recommendedJobs && recommendedJobs.length === 0 ? (
            <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl">
              <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <h4 className="font-bold text-slate-700 text-sm mb-1">
                Chưa có việc làm khớp với "{derivedKeyword}"
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Hãy khám phá các cơ hội việc làm khác đang mở tuyển.
              </p>
              <Button asChild size="sm" className="rounded-xl bg-[#1549B8] hover:bg-[#1240A0]">
                <Link to="/jobs">Xem danh sách việc làm</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedJobs &&
                recommendedJobs.map((job, idx) => (
                  <div
                    key={job.id}
                    className="p-5 rounded-2xl bg-[#F8FAFC] hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start gap-3.5 mb-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-xs shrink-0"
                          style={{
                            backgroundColor: LOGO_COLORS[idx % LOGO_COLORS.length].bg,
                            color: LOGO_COLORS[idx % LOGO_COLORS.length].text,
                          }}
                        >
                          {job.company ? job.company.slice(0, 2).toUpperCase() : "CO"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-[#0F172A] truncate">
                            {job.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            {job.company || "Doanh nghiệp"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mb-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-white px-2.5 py-1 rounded-lg font-medium">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {job.location || "Toàn quốc"}
                        </span>
                        {job.salary && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg font-semibold">
                            <DollarSign className="h-3 w-3" />
                            {job.salary}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button asChild variant="outline" size="sm" className="rounded-xl text-xs h-8">
                        <Link to={`/jobs/${job.id}`}>Chi tiết</Link>
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        className="rounded-xl text-xs h-8 bg-[#1549B8] hover:bg-[#1240A0] text-white"
                      >
                        <Link to={`/jobs/${job.id}`}>Ứng tuyển</Link>
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CVUploadPage() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");
  const paramJobTitle = searchParams.get("jobTitle");

  const [file, setFile] = useState(null);
  const [targetPos, setTargetPos] = useState(paramJobTitle || "");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | uploading | result
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFile = useCallback((f) => {
    if (!f.name.match(/\.(pdf|doc|docx)$/i)) {
      setError("Chỉ hỗ trợ định dạng PDF, DOC, DOCX");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("Kích thước file không vượt quá 10MB");
      return;
    }
    setFile(f);
    setError("");
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleSubmit = async () => {
    if (!file) return;
    setStatus("uploading");
    setProgress(0);
    try {
      const res = await cvService.scoreCV(
        file,
        { targetPosition: targetPos, jobId, jobTitle: paramJobTitle },
        setProgress
      );
      setResult(res);
      setStatus("result");
    } catch (err) {
      setError(err?.message || "Lỗi khi phân tích CV. Vui lòng thử lại.");
      setStatus("idle");
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setStatus("idle");
    setError("");
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 font-sans">
      {/* Top Banner - Candidate Blue Theme */}
      <div className="bg-[#0F172A] text-white pt-10 pb-8 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1549B8]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="container-app relative z-10 text-center">
          <h1 className="text-2xl sm:text-4xl font-black text-white mb-2 tracking-tight">
            {jobId ? "Độ tương thích CV & Công việc" : "Chấm điểm CV chuẩn ATS"}
          </h1>
          <p className="text-slate-300 text-sm max-w-lg mx-auto">
            {jobId
              ? `Đối soát CV trực tiếp với vị trí: ${paramJobTitle}`
              : "Phân tích mức độ tương thích và gợi ý tối ưu hồ sơ trong 30 giây."}
          </p>
        </div>
      </div>

      <div className="container-app">
        {status === "result" ? (
          <ScoreResult result={result} onReset={reset} />
        ) : (
          <div className="max-w-4xl mx-auto">
            {status === "uploading" ? (
              /* Loading State */
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center shadow-xs border border-slate-200/80 max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1549B8] flex items-center justify-center mx-auto mb-5 animate-pulse">
                  <FileCheck className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-lg text-[#0F172A] mb-1">
                  AI đang phân tích hồ sơ...
                </h3>
                <p className="text-xs text-slate-500 mb-6 truncate max-w-xs mx-auto">
                  {file?.name}
                </p>

                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2 max-w-xs mx-auto">
                  <div
                    className="h-full rounded-full bg-[#1549B8] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-[#1549B8]">{progress}%</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* Column 1: Upload Card (Dropzone) */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 flex flex-col justify-between">
                  <div className="mb-4">
                    <h2 className="text-base font-bold text-slate-900 mb-1">Tải lên hồ sơ CV</h2>
                    <p className="text-xs text-slate-500">Hỗ trợ định dạng PDF, DOC, DOCX</p>
                  </div>

                  {/* Dropzone */}
                  <div
                    className={cn(
                      "rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 border-2 border-dashed flex-1 flex flex-col items-center justify-center min-h-[260px]",
                      dragging
                        ? "border-[#1549B8] bg-blue-50/50"
                        : "border-slate-200 hover:border-[#1549B8] hover:bg-slate-50/60"
                    )}
                    onDrop={handleDrop}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onClick={() => inputRef.current?.click()}
                  >
                    <input
                      ref={inputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
                      className="hidden"
                    />

                    {file ? (
                      <div className="flex items-center justify-between p-3.5 bg-blue-50/60 rounded-xl w-full">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-6 w-6 text-[#1549B8] shrink-0" />
                          <div className="text-left min-w-0">
                            <p className="text-sm font-bold text-[#0F172A] truncate max-w-[180px] sm:max-w-xs">{file.name}</p>
                            <p className="text-xs text-slate-500 font-medium">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                          }}
                          className="p-1 hover:bg-blue-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-14 h-14 bg-blue-50 text-[#1549B8] rounded-2xl flex items-center justify-center mx-auto mb-3.5">
                          {dragging ? (
                            <Upload className="h-6 w-6" />
                          ) : (
                            <FileText className="h-6 w-6" />
                          )}
                        </div>
                        <h3 className="font-bold text-sm sm:text-base text-[#0F172A] mb-1">
                          {dragging ? "Thả file vào đây" : "Kéo thả CV hoặc nhấn để tải lên"}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">
                          Tối đa 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Column 2: Information & Actions */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    {/* Target position input */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="target-pos"
                        className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <Target className="h-3.5 w-3.5 text-[#1549B8]" />
                        <span>Vị trí ứng tuyển mục tiêu (Tùy chọn)</span>
                      </Label>
                      <Input
                        id="target-pos"
                        value={targetPos}
                        onChange={(e) => setTargetPos(e.target.value)}
                        placeholder="VD: Frontend Developer, Product Manager..."
                        className="h-11 rounded-xl border-slate-200 focus:border-[#1549B8] focus:ring-2 focus:ring-[#1549B8]/20 text-sm"
                      />
                    </div>

                    {/* 5 Core ATS Evaluation Criteria (Minimal soft tags, no dividers) */}
                    <div>
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                        Tiêu chí đánh giá hệ thống:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Kỹ năng cốt lõi",
                          "Kinh nghiệm chuyên môn",
                          "Học vấn & Chứng chỉ",
                          "Định dạng chuẩn ATS",
                          "Từ khóa JD",
                        ].map((crit) => (
                          <span
                            key={crit}
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-medium"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span>{crit}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Bottom */}
                  <div className="space-y-3 pt-2">
                    {/* Error banner */}
                    {error && (
                      <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs sm:text-sm text-rose-700 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      size="lg"
                      onClick={handleSubmit}
                      disabled={!file}
                      className="w-full h-11 bg-[#1549B8] hover:bg-[#1240A0] text-white font-bold rounded-xl shadow-md cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileCheck className="h-4 w-4 mr-1.5" />
                      <span>{jobId ? "Kiểm tra mức độ phù hợp" : "Bắt đầu chấm điểm CV"}</span>
                    </Button>

                    {/* Privacy note */}
                    <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                      <Lock className="h-3 w-3" />
                      <span>Hồ sơ được bảo mật tuyệt đối</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
