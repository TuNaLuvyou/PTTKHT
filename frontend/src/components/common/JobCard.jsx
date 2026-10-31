import { useNavigate } from "react-router-dom";
import { MapPin, DollarSign, Clock } from "lucide-react";

// Company logo background colors
const LOGO_COLORS = [
  { bg: "#EEF2FF", text: "#1549B8" },
  { bg: "#F5F3FF", text: "#7C3AED" },
  { bg: "#ECFDF5", text: "#059669" },
  { bg: "#FFF7ED", text: "#EA580C" },
  { bg: "#FEF2F2", text: "#DC2626" },
  { bg: "#F0FDF4", text: "#16A34A" },
];

const LEVEL_BADGE = {
  Intern: { bg: "#F1F5F9", text: "#64748B" },
  Junior: { bg: "#ECFDF5", text: "#059669" },
  Middle: { bg: "#EEF2FF", text: "#1549B8" },
  Senior: { bg: "#FFF7ED", text: "#C2410C" },
  "Lead/Manager": { bg: "#FDF4FF", text: "#7E22CE" },
};

export default function JobCard({ job, index = 0 }) {
  const navigate = useNavigate();
  const daysAgo = Math.floor((Date.now() - new Date(job.postedAt)) / 86400000);
  const logoColor = LOGO_COLORS[index % LOGO_COLORS.length];
  const levelStyle = LEVEL_BADGE[job.level] || LEVEL_BADGE.Middle;

  return (
    <div
      onClick={() => navigate(`/jobs/${job.id}`)}
      className="bg-white rounded-2xl p-5 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer group flex flex-col justify-between"
    >
      <div>
        {/* Header row: Logo + Title + Company */}
        <div className="flex items-start gap-3.5 mb-3.5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-transform group-hover:scale-105"
            style={{ backgroundColor: logoColor.bg, color: logoColor.text }}
          >
            {job.company.slice(0, 2).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#1549B8] transition-colors truncate">
                {job.title}
              </h3>
              {job.featured && (
                <span className="shrink-0 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1549B8]">
                  Nổi bật
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">{job.company}</p>
          </div>
        </div>

        {/* Info badges: Location, Salary, Level (no border lines, soft pills) */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg font-medium">
            <MapPin className="h-3 w-3 text-slate-400" />
            {job.location}
          </span>
          <span className="inline-flex items-center text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-bold">
            <DollarSign className="h-3 w-3" />
            {job.salary}
          </span>
          <span
            className="text-[11px] px-2.5 py-1 rounded-lg font-semibold"
            style={{ backgroundColor: levelStyle.bg, color: levelStyle.text }}
          >
            {job.level}
          </span>
        </div>

        {/* Skill tags (soft pills, zero border lines) */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.tags.map((t) => (
            <span
              key={t}
              className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-slate-50 text-slate-600 group-hover:bg-blue-50 group-hover:text-[#1549B8] transition-colors"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Footer row: zero divider line, just clean subtle spacing */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {daysAgo === 0 ? "Hôm nay" : `${daysAgo} ngày trước`}
        </span>
        <span className="font-medium text-slate-500">{job.applied} ứng tuyển</span>
      </div>
    </div>
  );
}
