import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bot, FileText, BarChart3, Activity, CheckCircle2, AlertTriangle,
  MessageSquare, Lightbulb, ChevronDown, ChevronUp, Trash2
} from 'lucide-react'
import ScoreBar from '@/components/scoring/ScoreBar'
import RadarChart from '@/components/scoring/RadarChart'

const STATUS_CONFIG = {
  pending: { label: 'Chờ xem', color: '#F59E0B', bg: '#FEF3C7', next: 'reviewing' },
  reviewing: { label: 'Đang xét', color: '#3B82F6', bg: '#DBEAFE', next: 'interview' },
  interview: { label: 'Phỏng vấn', color: '#8B5CF6', bg: '#EDE9FE', next: 'offered' },
  offered: { label: 'Đã offer', color: '#10B981', bg: '#D1FAE5', next: null },
  rejected: { label: 'Từ chối', color: '#EF4444', bg: '#FEE2E2', next: null },
}

const getCvUrl = (path) => {
  if (!path || path === '#') return '#'
  if (path.startsWith('http')) return path
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
  const host = baseUrl.replace(/\/api\/?$/, '')
  const token = localStorage.getItem('nexcv_employer_token') || localStorage.getItem('nexcv_token')
  const separator = path.includes('?') ? '&' : '?'
  return `${host}${path}${token ? `${separator}token=${token}` : ''}`
}

export default function ApplicantCard({ app, onStatusChange, onScore, isSelected, onSelect, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)
  const navigate = useNavigate()
  const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending
  const score = app.ai_score?.overall_score || 0
  const scoreColor = score >= 85 ? '#10B981' : score >= 70 ? '#3B82F6' : score >= 55 ? '#F59E0B' : '#EF4444'

  const seekerId = app.seeker?.id || app.seeker?._id || app.seeker_id
  const initials = app.seeker?.full_name
    ? app.seeker.full_name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()
    : 'CV'

  const handleStatus = async (newStatus) => {
    setUpdating(true)
    await onStatusChange(app.id, newStatus)
    setUpdating(false)
  }

  return (
    <div
      className={`bg-white rounded-xl border border-border overflow-hidden transition-all duration-200 hover:shadow-md ${updating ? 'opacity-60' : 'opacity-100'}`}
    >
      {/* Main row */}
      <div className="p-[18px_20px] flex items-start sm:items-center gap-3 sm:gap-4 flex-wrap">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="size-4.5 cursor-pointer accent-blue-500 mr-1"
        />

        {/* Avatar - clickable to view candidate profile */}
        <button
          type="button"
          onClick={() => seekerId && navigate(`/candidates/${seekerId}`)}
          className="size-11 rounded-full shrink-0 flex items-center justify-center text-white font-extrabold text-[15px] bg-linear-to-br from-blue-800 to-violet-700 cursor-pointer hover:scale-105 transition-transform border-none"
          title="Xem hồ sơ ứng viên"
        >
          {initials}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-[#0F172A]">{app.seeker.full_name}</span>
            <span
              className="text-[11px] font-bold px-2.25 py-0.5 rounded-full"
              style={{ backgroundColor: cfg.bg, color: cfg.color }}
            >
              {cfg.label}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {app.seeker.email} • Nộp {new Date(app.applied_at).toLocaleDateString('vi-VN')}
          </div>
          <div className="text-xs text-slate-300 mt-0.5 flex items-center gap-1">
            <FileText size={12} /> {app.resume.title}
          </div>
        </div>

        {/* AI Score */}
        <div className="text-center shrink-0 min-w-16">
          {app.ai_score ? (
            <div
              className="text-[22px] font-black leading-none rounded-xl px-3.5 py-1.5"
              style={{ color: scoreColor, backgroundColor: scoreColor + '18' }}
            >
              {score.toFixed(0)}
            </div>
          ) : (
            <div className="text-sm font-semibold text-slate-400 leading-none rounded-xl px-3.5 py-2.5 bg-muted">
              N/A
            </div>
          )}
          <div className="text-[10px] text-slate-400 mt-0.5 font-semibold">AI Score</div>
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 sm:gap-2 flex-wrap items-center w-full sm:w-auto sm:ml-auto">
          <button
            onClick={onScore}
            className="px-2.5 sm:px-3 py-1.75 rounded-lg border border-purple-200 bg-purple-50 text-purple-600 cursor-pointer text-[11px] sm:text-xs font-bold flex items-center gap-1 hover:bg-purple-100 transition-colors"
          >
            <Bot size={14} /> {app.ai_score ? 'Chấm lại' : 'Chấm điểm'}
          </button>

          {cfg.next && (
            <button
              onClick={() => handleStatus(cfg.next)}
              disabled={updating}
              className="px-2.5 sm:px-3.5 py-1.75 rounded-lg border-none text-white cursor-pointer text-[11px] sm:text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-linear-to-br from-blue-800 to-blue-500"
            >
              → {STATUS_CONFIG[cfg.next]?.label}
            </button>
          )}

          {app.status !== 'rejected' && app.status !== 'offered' && (
            <button
              onClick={() => handleStatus('rejected')}
              disabled={updating}
              className="px-2.5 sm:px-3.5 py-1.75 rounded-lg border border-red-300 bg-red-50 text-red-500 cursor-pointer text-[11px] sm:text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-100"
            >
              Từ chối
            </button>
          )}

          <button
            onClick={onDelete}
            className="px-2.5 py-1.75 rounded-lg border border-red-300 bg-red-50 text-red-500 cursor-pointer text-xs transition-all duration-200 hover:bg-red-500 hover:text-white flex items-center justify-center"
            title="Xóa hồ sơ này"
          >
            <Trash2 size={14} />
          </button>

          <button
            onClick={() => setExpanded(e => !e)}
            className={`px-3 py-1.75 rounded-lg border border-border cursor-pointer text-xs transition-colors ${expanded ? 'bg-muted' : 'bg-white'}`}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border p-[24px_28px] bg-[#FAFAFA]">
          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_2fr] gap-6 items-start">
            {/* Left: Scores & Radar */}
            {app.ai_score && (
              <div className="flex flex-col gap-6 bg-[#F8FAFC] p-5 rounded-xl border border-border">
                {/* Score bars */}
                <div>
                  <h4 className="text-sm font-bold text-[#0F172A] mb-4 flex items-center gap-1.5">
                    <BarChart3 size={16} /> Điểm chi tiết
                  </h4>
                  <ScoreBar label="Kỹ năng" value={app.ai_score.breakdown.skills} color="#3B82F6" />
                  <ScoreBar label="Kinh nghiệm" value={app.ai_score.breakdown.experience} color="#8B5CF6" />
                  <ScoreBar label="Học vấn" value={app.ai_score.breakdown.education} color="#10B981" />
                  <ScoreBar label="Từ khóa" value={app.ai_score.breakdown.keywords} color="#F59E0B" />
                </div>

                {/* Radar chart */}
                <div className="border-t border-border pt-5 flex flex-col items-center">
                  <h4 className="text-sm font-bold text-[#0F172A] mb-3 w-full flex items-center gap-1.5">
                    <Activity size={16} /> Biểu đồ năng lực
                  </h4>
                  <RadarChart
                    skills={app.ai_score.breakdown.skills}
                    experience={app.ai_score.breakdown.experience}
                    education={app.ai_score.breakdown.education}
                    keywords={app.ai_score.breakdown.keywords}
                  />
                </div>
              </div>
            )}

            {/* Right: Cover letter & Review */}
            <div className="flex flex-col gap-4.5">
              {/* AI Review */}
              <div>
                <h4 className="text-sm font-bold text-[#0F172A] mb-2.5 flex items-center gap-1.5">
                  <Bot size={16} /> Đánh giá góc nhìn tuyển dụng (AI):
                </h4>
                {app.ai_score?.review ? (
                  <p className="text-sm text-amber-700 leading-relaxed m-0 p-[14px_16px] bg-amber-50 rounded-xl border border-amber-200 italic whitespace-pre-wrap">
                    {app.ai_score.review}
                  </p>
                ) : (
                  <div className="text-sm text-[#475569] leading-relaxed p-[14px_16px] bg-muted rounded-xl border border-border flex gap-2 items-center">
                    <Lightbulb size={16} className="shrink-0" />
                    <span>Hãy nhấn nút <b>Chấm điểm</b> hoặc <b>Chấm lại</b> để AI tự động phân tích CV này dưới góc nhìn nhà tuyển dụng!</span>
                  </div>
                )}
              </div>

              {/* Strengths */}
              {app.ai_score?.analysis?.strengths?.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-[14px_16px]">
                  <h5 className="m-0 mb-2 text-sm font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 size={14} /> Ưu điểm nổi bật (ATS):
                  </h5>
                  <ul className="m-0 pl-4 text-sm text-emerald-800 leading-relaxed">
                    {app.ai_score.analysis.strengths.map((str, idx) => (
                      <li key={idx} className="mb-1">{str}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {app.ai_score?.analysis?.improvements?.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-[14px_16px]">
                  <h5 className="m-0 mb-2 text-sm font-bold text-red-800 flex items-center gap-1">
                    <AlertTriangle size={14} /> Điểm cần cải thiện (ATS):
                  </h5>
                  <ul className="m-0 pl-4 text-sm text-red-800 leading-relaxed">
                    {app.ai_score.analysis.improvements.map((imp, idx) => (
                      <li key={idx} className="mb-1">{imp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cover letter */}
              <div>
                <h4 className="text-sm font-bold text-[#0F172A] mb-2.5 flex items-center gap-1.5">
                  <MessageSquare size={16} /> Thư giới thiệu
                </h4>
                {app.cover_letter ? (
                  <p className="text-sm text-[#475569] leading-relaxed m-0 p-[14px_16px] bg-white rounded-xl border border-border whitespace-pre-wrap">
                    {app.cover_letter}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic m-0">Không có thư giới thiệu</p>
                )}
              </div>

              {/* CV link */}
              <div className="mt-2 flex gap-2.5 border-t border-border pt-4">
                <a
                  href={getCvUrl(app.resume.pdf_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4.5 py-2.25 rounded-lg text-sm font-semibold bg-blue-50 text-blue-600 border border-blue-200 no-underline hover:bg-blue-100 transition-colors"
                >
                  <FileText size={14} /> Xem CV ứng viên
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
