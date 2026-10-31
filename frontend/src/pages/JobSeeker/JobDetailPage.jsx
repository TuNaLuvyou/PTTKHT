import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  Bookmark,
  Share2,
  CheckCircle2,
  ChevronRight,
  Eye,
  Users2,
  Send,
  FileText,
  Gift,
  FileCheck,
  ArrowRight,
  Loader2,
  Check,
  UploadCloud,
  X,
  Building2
} from 'lucide-react'
import Skeleton, { SkeletonCard } from '@/components/common/Skeleton'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { jobService } from '@/services/jobService'

const LEVEL_BADGE = {
  Intern: { bg: 'bg-slate-100', text: 'text-slate-600' },
  Junior: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  Middle: { bg: 'bg-blue-50', text: 'text-[#1549B8]' },
  Senior: { bg: 'bg-amber-50', text: 'text-amber-700' },
  'Lead/Manager': { bg: 'bg-purple-50', text: 'text-purple-700' },
}

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [applied, setApplied] = useState(false)
  const [applying, setApplying] = useState(false)
  const [showApply, setShowApply] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [cvFile, setCvFile] = useState(null)
  const [hasCV, setHasCV] = useState(false)
  const [related, setRelated] = useState([])
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    jobService.getJob(id).then(res => {
      if (cancelled) return
      setJob(res)
      jobService.getJobs({ category: res.category, limit: 4 }).then(r => {
        if (!cancelled) setRelated((r.data || []).filter(j => j.id !== id && (j._id || j.id) !== id).slice(0, 3))
      })
    }).catch(() => navigate('/jobs')).finally(() => { if (!cancelled) setLoading(false) })

    if (isAuthenticated) {
      jobService.getSavedJobs().then(list => {
        if (cancelled) return
        const arr = Array.isArray(list) ? list : (list?.data || [])
        const isSaved = arr.some(j => {
          const jid = j._id || j.id
          return String(jid) === String(id)
        })
        setSaved(isSaved)
      }).catch(() => {})

      jobService.getAppliedJobs().then(list => {
        if (cancelled) return
        const arr = Array.isArray(list) ? list : (list?.data || [])
        const isApplied = arr.some(app => {
          const jid = app.jobId?._id || app.jobId?.id || app.jobId || app.job_id
          return String(jid) === String(id)
        })
        setApplied(isApplied)
      }).catch(() => {})

      import('@/services/cvService').then(({ cvService }) => {
        cvService.getScoreHistory().then(cvs => {
          if (cancelled) return
          const specificCV = cvs?.find(cv => String(cv.jobId?._id || cv.jobId || cv.job_id) === String(id))
          setHasCV(!!specificCV)
        }).catch(() => {})
      })
    }

    return () => { cancelled = true }
  }, [id, isAuthenticated, navigate])

  const handleApply = async () => {
    if (!isAuthenticated) { navigate('/login', { state: { from: `/jobs/${id}` } }); return }
    if (!hasCV && !cvFile) { alert('Vui lòng tải lên CV của bạn để ứng tuyển.'); return }
    
    setApplying(true)
    try {
      let data = { coverLetter }
      if (cvFile) {
        const formData = new FormData()
        formData.append('cv', cvFile)
        formData.append('coverLetter', coverLetter)
        data = formData
      }
      
      await jobService.applyJob(id, data)
      setApplied(true)
      setShowApply(false)
    } catch (err) {
      alert(err?.message || 'Lỗi khi ứng tuyển')
    } finally {
      setApplying(false)
    }
  }

  const handleSave = async () => {
    if (!isAuthenticated) { navigate('/login', { state: { from: `/jobs/${id}` } }); return }
    try {
      setSaving(true)
      const res = await jobService.toggleSaveJob(String(job._id || job.id || id))
      const nowSaved = typeof res?.saved === 'boolean' ? res.saved : !saved
      setSaved(nowSaved)
    } catch (err) {
      alert(`Không thể lưu việc làm: ${err?.message || 'Lỗi không xác định'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-[1fr_340px] gap-6">
      <div className="space-y-6">
        <SkeletonCard lines={4} badge />
        <Skeleton variant="chart" />
      </div>
      <div className="space-y-6">
        <SkeletonCard lines={6} />
        <SkeletonCard lines={3} />
      </div>
    </div>
  )

  if (!job) return null

  const daysAgo = Math.floor((Date.now() - new Date(job.postedAt || Date.now())) / 86400000)
  const levelStyle = LEVEL_BADGE[job.level] || LEVEL_BADGE.Middle
  const requirementsList = Array.isArray(job.requirements)
    ? job.requirements
    : typeof job.requirements === 'string'
      ? job.requirements.split('\n').filter(Boolean)
      : []

  const benefitsList = Array.isArray(job.benefits)
    ? job.benefits
    : typeof job.benefits === 'string'
      ? job.benefits.split('\n').filter(Boolean)
      : []

  const tagsList = Array.isArray(job.tags) && job.tags.length > 0
    ? job.tags
    : Array.isArray(job.required_skills)
      ? job.required_skills
      : []

  const overviewItems = [
    ['Cấp bậc', job.level || 'Không yêu cầu'],
    ['Ngành nghề', job.category || 'Công nghệ thông tin'],
    ['Hình thức', job.type || 'Toàn thời gian'],
    ['Mức lương', job.salary || 'Thỏa thuận'],
    ['Địa điểm', job.location || 'Toàn quốc'],
    ['Hạn nộp', job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : 'Đang mở'],
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Link to="/" className="hover:text-slate-700 transition-colors">Trang chủ</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/jobs" className="hover:text-slate-700 transition-colors">Việc làm</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-700 font-medium truncate max-w-[280px] sm:max-w-md">{job.title}</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Left Column: Details */}
        <div className="space-y-6">

          {/* Job Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1549B8] font-black text-xl flex items-center justify-center shrink-0">
                {(job.company || 'N').slice(0, 2).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {job.title}
                </h1>
                <p className="text-[#1549B8] font-bold text-sm mt-1 mb-3">
                  {job.company}
                </p>

                {/* Soft Badges without borders */}
                <div className="flex flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl">
                    <DollarSign className="h-3.5 w-3.5" />
                    {job.salary}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {job.type}
                  </span>
                  <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl ${levelStyle.bg} ${levelStyle.text}`}>
                    <Briefcase className="h-3.5 w-3.5" />
                    {job.level}
                  </span>
                </div>
              </div>
            </div>

            {/* Skills & Tags */}
            {tagsList.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {tagsList.map(tag => (
                  <span key={tag} className="text-xs font-semibold px-3 py-1 rounded-xl bg-blue-50 text-[#1549B8]">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Bottom Meta & Action Bar (Zero Separator) */}
            <div className="mt-7 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  {job.views || 0} lượt xem
                </span>
                <span className="flex items-center gap-1.5">
                  <Users2 className="h-3.5 w-3.5" />
                  {job.applied || 0} ứng tuyển
                </span>
                <span>
                  {daysAgo === 0 ? 'Hôm nay' : `${daysAgo} ngày trước`}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                {applied ? (
                  <div className="flex items-center gap-2 px-5 h-11 bg-emerald-50 rounded-xl text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Đã ứng tuyển
                  </div>
                ) : (
                  <Button
                    onClick={() => isAuthenticated ? setShowApply(true) : navigate('/login', { state: { from: `/jobs/${id}` } })}
                    className="bg-[#1549B8] hover:bg-[#1240A0] text-white font-bold h-11 px-7 rounded-xl shadow-xs gap-2 transition-all"
                  >
                    <Send className="h-4 w-4" />
                    {isAuthenticated ? 'Ứng tuyển ngay' : 'Đăng nhập để ứng tuyển'}
                  </Button>
                )}

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className={`h-11 w-11 rounded-xl flex items-center justify-center transition-colors ${
                    saved ? 'bg-amber-50 text-amber-500' : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                  }`}
                  title={saved ? 'Đã lưu' : 'Lưu tin'}
                >
                  <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="h-11 w-11 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 flex items-center justify-center transition-colors relative"
                  title="Chia sẻ tin tuyển dụng"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Job Content Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-8">
            {/* Description */}
            <div>
              <div className="flex items-center gap-2.5 mb-3.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1549B8] flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Mô tả công việc</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line pl-1">
                {job.description}
              </p>
            </div>

            {/* Requirements */}
            {requirementsList.length > 0 && (
              <div>
                <div className="flex items-center gap-2.5 mb-3.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1549B8] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">Yêu cầu ứng viên</h2>
                </div>
                <div className="space-y-2">
                  {requirementsList.map((req, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/70">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-[#1549B8] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3 w-3 stroke-[2.5]" />
                      </div>
                      <span className="text-sm text-slate-700 leading-relaxed">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            {benefitsList.length > 0 && (
              <div>
                <div className="flex items-center gap-2.5 mb-3.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Gift className="h-4 w-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">Quyền lợi & Đãi ngộ</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {benefitsList.map((benefit, i) => (
                    <span key={i} className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700">
                      <Gift className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Deadline Box */}
          {job.deadline && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl text-amber-900 text-sm font-medium">
              <Clock className="h-5 w-5 text-amber-600 shrink-0" />
              <p>
                <span className="font-bold">Hạn nộp hồ sơ:</span> {new Date(job.deadline).toLocaleDateString('vi-VN')}
              </p>
            </div>
          )}

        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-5 sticky self-start" style={{ top: 'calc(var(--header-height, 64px) + 20px)' }}>

          {/* Job Overview Card */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80">
            <h3 className="font-bold text-sm text-slate-900 mb-4">Tổng quan vị trí</h3>
            <div className="space-y-2">
              {overviewItems.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs">
                  <span className="text-slate-500 font-medium">{label}</span>
                  <span className="font-bold text-slate-900 text-right truncate max-w-[60%]">{value}</span>
                </div>
              ))}
            </div>

            {/* CV Match Check Shortcut */}
            <Link
              to={`/cv-upload?jobId=${job.id}&jobTitle=${encodeURIComponent(job.title)}`}
              className="flex items-center justify-between mt-4 p-3.5 bg-blue-50 hover:bg-blue-100/80 rounded-2xl transition-all group no-underline"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white text-[#1549B8] flex items-center justify-center shadow-xs">
                  <FileCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1549B8]">Mức độ phù hợp CV</p>
                  <p className="text-[11px] text-blue-700">Kiểm tra tỷ lệ đối soát</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-[#1549B8] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Similar Jobs Card */}
          {related.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80">
              <h3 className="font-bold text-sm text-slate-900 mb-3">Việc làm tương tự</h3>
              <div className="space-y-2">
                {related.map(rj => (
                  <Link
                    key={rj.id}
                    to={`/jobs/${rj.id}`}
                    className="block p-3 rounded-2xl bg-slate-50/70 hover:bg-blue-50/60 transition-colors no-underline group"
                  >
                    <p className="font-bold text-xs text-slate-900 group-hover:text-[#1549B8] transition-colors line-clamp-1">
                      {rj.title}
                    </p>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                      <span className="truncate max-w-[60%]">{rj.company}</span>
                      <span className="font-semibold text-emerald-700">{rj.salary}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Apply Dialog */}
      <Dialog open={showApply} onOpenChange={setShowApply}>
        <DialogContent className="sm:max-w-md w-full rounded-3xl p-6 sm:p-7 border-0 shadow-2xl bg-white">
          <div className="pr-6">
            <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
              Nộp hồ sơ ứng tuyển
            </DialogTitle>
            <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1549B8] font-bold text-sm flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 truncate">{job.title}</h4>
                <p className="text-[11px] text-slate-500 truncate">{job.company}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 my-1">
            {/* CV Selection / Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-slate-900 font-bold text-xs">
                  Tải lên CV (Bắt buộc) <span className="text-rose-500">*</span>
                </Label>
                {hasCV && !cvFile && (
                  <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Đã gắn CV mặc định
                  </span>
                )}
              </div>

              {cvFile ? (
                <div className="p-3 bg-blue-50/60 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-[#1549B8] flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{cvFile.name}</p>
                      <p className="text-[11px] text-slate-500">{(cvFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCvFile(null)}
                    className="w-7 h-7 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                    title="Chọn file khác"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : hasCV ? (
                <div className="p-3 bg-emerald-50/70 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <FileCheck className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-emerald-950 truncate">Sử dụng CV trong hồ sơ</p>
                      <p className="text-[11px] text-emerald-700">Tự động đính kèm khi nộp</p>
                    </div>
                  </div>
                  <label className="text-[11px] font-bold text-[#1549B8] bg-white hover:bg-blue-50 px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0">
                    Đổi file khác
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={e => e.target.files?.[0] && setCvFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-200 hover:border-[#1549B8] bg-slate-50/50 hover:bg-blue-50/20 rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={e => e.target.files?.[0] && setCvFile(e.target.files[0])}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-xl bg-white shadow-xs group-hover:bg-blue-50 text-slate-400 group-hover:text-[#1549B8] flex items-center justify-center transition-colors">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 group-hover:text-[#1549B8] transition-colors">
                      Chọn hoặc kéo thả file CV
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Hỗ trợ PDF, DOC, DOCX (tối đa 10MB)
                    </p>
                  </div>
                </label>
              )}
            </div>

            {/* Cover Letter */}
            <div className="space-y-1.5">
              <Label className="text-slate-900 font-bold text-xs">Thư giới thiệu (Tuỳ chọn)</Label>
              <Textarea
                rows={3}
                placeholder="Ghi chú ngắn gọn cho nhà tuyển dụng..."
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                className="rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white text-xs text-slate-800 resize-none focus:border-[#1549B8] transition-all p-3"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowApply(false)}
              className="rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-semibold h-10 px-4 cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleApply}
              disabled={applying || (!hasCV && !cvFile)}
              className="bg-[#1549B8] hover:bg-[#1240A0] text-white rounded-xl font-bold text-xs h-10 px-5 gap-2 shadow-xs cursor-pointer disabled:opacity-50 transition-all"
            >
              {applying ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Xác nhận nộp đơn
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
