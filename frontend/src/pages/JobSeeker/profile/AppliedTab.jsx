import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, XCircle, Clock, Eye, CheckCircle, Mic, Briefcase, Send } from 'lucide-react'
import { jobService } from '@/services/jobService'

const STATUS_MAP = {
  pending:   { label: 'Đang chờ',   color: 'bg-slate-100 text-slate-600',     icon: Clock },
  reviewing: { label: 'Xem xét',    color: 'bg-blue-50 text-[#1549B8]',       icon: Eye },
  interview: { label: 'Phỏng vấn',  color: 'bg-violet-50 text-violet-700',    icon: Mic },
  offered:   { label: 'Mời làm',    color: 'bg-emerald-50 text-emerald-700',  icon: CheckCircle },
  rejected:  { label: 'Từ chối',    color: 'bg-rose-50 text-rose-600',        icon: XCircle },
}

export function AppliedTab() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    jobService.getAppliedJobs().then(res => {
      setApps(Array.isArray(res) ? res : (res?.data || []))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-[#1549B8]" /></div>

  const active   = apps.filter(a => !['rejected', 'offered'].includes(a.status))
  const resolved = apps.filter(a =>  ['rejected', 'offered'].includes(a.status))

  const renderCard = (app) => {
    const job = app.jobId
    const isJobDeleted = !job || (!job.title && !job._id)
    const status = STATUS_MAP[app.status] || STATUS_MAP.pending
    const StatusIcon = status.icon
    const isRejected = app.status === 'rejected'

    return (
      <div
        key={app._id}
        className={`rounded-2xl p-4 shadow-sm flex gap-3 items-start ${isRejected ? 'bg-rose-50/60' : 'bg-white'}`}
      >
        <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isRejected ? 'bg-rose-100 text-rose-400' : 'bg-[#EEF2FF] text-[#1549B8]'}`}>
          {isJobDeleted
            ? <Briefcase className="h-4 w-4" />
            : <span className="text-xs font-black">{job?.companyName?.slice(0, 2).toUpperCase() || 'CV'}</span>}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm text-[#0F172A] truncate">
              {isJobDeleted ? 'Tin đã bị gỡ' : job?.title}
            </p>
            <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg font-bold ${status.color}`}>
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </span>
          </div>

          {!isJobDeleted && (
            <p className="text-xs text-slate-500 mt-0.5 truncate">{job?.companyName} · {job?.location}</p>
          )}

          <p className="text-[11px] text-slate-400 mt-1">
            {new Date(app.createdAt).toLocaleDateString('vi-VN')}
          </p>

          {isRejected && (
            <p className="text-[11px] text-rose-500 font-medium mt-1.5 flex items-center gap-1">
              <XCircle className="h-3 w-3 shrink-0" />
              {isJobDeleted ? 'Tin đã gỡ — đơn tự động từ chối' : 'Nhà tuyển dụng đã từ chối'}
            </p>
          )}
        </div>

        {!isJobDeleted && !isRejected && job?._id && (
          <Link
            to={`/jobs/${job._id}`}
            className="inline-flex items-center h-8 px-3 rounded-lg bg-[#EEF2FF] text-[#1549B8] text-xs font-semibold hover:bg-[#E0E7FF] transition-colors shrink-0"
          >
            Chi tiết
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-[#0F172A] flex items-center gap-2">
          <Send className="h-4 w-4 text-[#1549B8]" />
          Đã ứng tuyển
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">{apps.length} đơn</p>
      </div>

      {apps.length === 0 ? (
        <div className="bg-white rounded-3xl px-6 py-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] flex items-center justify-center mx-auto mb-4">
            <Send className="h-6 w-6 text-[#1549B8]" />
          </div>
          <p className="font-bold text-[#0F172A]">Chưa ứng tuyển</p>
          <p className="text-sm text-slate-500 mt-1">Đơn ứng tuyển sẽ hiện tại đây</p>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#1549B8] text-white text-sm font-semibold hover:bg-[#1240A0] transition-colors mt-5"
          >
            <Briefcase className="h-4 w-4" />Tìm việc
          </Link>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> Đang xử lý ({active.length})
              </p>
              {active.map(renderCard)}
            </div>
          )}

          {resolved.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="h-3 w-3" /> Đã xong ({resolved.length})
              </p>
              {resolved.map(renderCard)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
