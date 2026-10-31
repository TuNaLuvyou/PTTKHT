import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Briefcase, BarChart3, DollarSign, Edit3, Users, CheckCircle2, PauseCircle, Trash2, Inbox, MoreHorizontal, Plus } from 'lucide-react'
import EmptyState from '@/components/common/EmptyState'
import { SkeletonPage } from '@/components/common/Skeleton'
import { employerService } from '../../services/employerService'

const STATUS_CONFIG = {
  active:  { label: 'Đang tuyển', cls: 'text-emerald-600 bg-emerald-100 border-emerald-200' },
  pending: { label: 'Chờ duyệt',  cls: 'text-amber-600 bg-amber-100 border-amber-200' },
  draft:   { label: 'Bản nháp',   cls: 'text-slate-500 bg-slate-100 border-slate-200' },
  expired: { label: 'Hết hạn',    cls: 'text-red-500 bg-red-100 border-red-200' },
  closed:  { label: 'Đã đóng',    cls: 'text-slate-400 bg-slate-50 border-slate-200' },
}

const JOB_TYPE_LABEL = {
  'full-time': 'Toàn thời gian',
  'part-time': 'Bán thời gian',
  'remote': 'Remote',
  'internship': 'Thực tập',
}

const LEVEL_LABEL = {
  intern: 'Intern', fresher: 'Fresher', junior: 'Junior', mid: 'Mid-level', senior: 'Senior',
}

function formatSalary(min, max) {
  const fmt = (n) => n >= 1000000 ? (n / 1000000).toFixed(0) + 'tr' : n.toLocaleString()
  if (!min && !max) return 'Thỏa thuận'
  if (!max) return `Từ ${fmt(min)}`
  if (!min) return `Đến ${fmt(max)}`
  return `${fmt(min)} – ${fmt(max)}`
}

function JobCard({ job, onDelete, onStatusChange }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const menuRef = useRef(null)
  const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.draft
  const navigate = useNavigate()

  // Auto-close dropdown when clicking outside, scrolling, or pressing Escape
  useEffect(() => {
    if (!menuOpen) return

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    const handleScroll = () => setMenuOpen(false)
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('scroll', handleScroll, true)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('scroll', handleScroll, true)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  const handleDelete = async () => {
    if (!confirm(`Xóa tin "${job.title}"?`)) return
    setDeleting(true)
    await onDelete(job.id)
  }

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-5 transition-shadow hover:shadow-md ${deleting ? 'opacity-50' : ''}`}
    >
      <div className="flex justify-between items-start gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h3 className="text-[15px] font-bold text-slate-900 m-0">{job.title}</h3>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${cfg.cls}`}>
              {cfg.label}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 mb-2.5">
            {[
              { icon: <MapPin size={14} className="text-slate-400 shrink-0" />, text: job.location },
              { icon: <Briefcase size={14} className="text-slate-400 shrink-0" />, text: JOB_TYPE_LABEL[job.job_type] },
              { icon: <BarChart3 size={14} className="text-slate-400 shrink-0" />, text: LEVEL_LABEL[job.level] },
              { icon: <DollarSign size={14} className="text-slate-400 shrink-0" />, text: formatSalary(job.salary_min, job.salary_max) },
            ].map(item => (
              <span key={item.text} className="text-xs text-slate-500 flex items-center gap-1">
                {item.icon} {item.text}
              </span>
            ))}
          </div>

          {job.required_skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {job.required_skills.slice(0, 5).map(skill => (
                <span key={skill} className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200 font-medium">
                  {skill}
                </span>
              ))}
              {job.required_skills.length > 5 && (
                <span className="text-[11px] text-slate-400">+{job.required_skills.length - 5}</span>
              )}
            </div>
          )}
        </div>

        {/* Stats + menu */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-center">
            <div className="text-lg font-black text-slate-900">{job.application_count}</div>
            <div className="text-[11px] text-slate-400">Ứng tuyển</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black text-slate-900">{job.view_count}</div>
            <div className="text-[11px] text-slate-400">Lượt xem</div>
          </div>

          {/* Action menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="bg-slate-50 border border-slate-200 rounded-lg w-9 h-9 cursor-pointer flex items-center justify-center hover:bg-slate-100 transition-colors"
            ><MoreHorizontal size={16} className="text-slate-500" /></button>
            {menuOpen && (
              <div
                className="absolute right-0 top-11 z-50 bg-white rounded-xl border border-slate-200 shadow-xl min-w-45 overflow-hidden"
                onMouseLeave={() => setMenuOpen(false)}
              >
                {[
                  { icon: <Edit3 size={14} />, label: 'Chỉnh sửa', action: () => navigate(`/employer/jobs/${job.id}/edit`) },
                  { icon: <Users size={14} />, label: 'Xem ứng viên', action: () => navigate(`/employer/jobs/${job.id}/applicants`) },
                  job.status === 'draft'
                    ? { icon: <CheckCircle2 size={14} />, label: 'Gửi duyệt tin', action: () => { onStatusChange(job.id, 'pending'); setMenuOpen(false) } }
                    : job.status === 'pending'
                    ? null
                    : { icon: <PauseCircle size={14} />, label: 'Tạm đóng', action: () => { onStatusChange(job.id, 'closed'); setMenuOpen(false) } },
                  { icon: <Trash2 size={14} />, label: 'Xóa tin', action: handleDelete, danger: true },
                ].filter(Boolean).map(item => (
                  <button
                    key={item.label}
                    onClick={() => { item.action(); setMenuOpen(false) }}
                    className={`w-full px-4 py-2.5 bg-transparent border-none cursor-pointer text-[13px] font-medium text-left flex items-center gap-2.5 font-inherit transition-colors duration-150 ${
                      item.danger ? 'text-red-500 hover:bg-red-50' : 'text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-4 inline-flex justify-center shrink-0 ${item.danger ? 'text-red-500' : 'text-slate-400'}`}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 mt-3.5 pt-3 flex justify-between items-center flex-wrap gap-2">
        <span className="text-xs text-slate-400">
          Đăng {new Date(job.created_at).toLocaleDateString('vi-VN')}
          {job.expired_at && ` • Hết hạn ${new Date(job.expired_at).toLocaleDateString('vi-VN')}`}
        </span>
        <Link
          to={`/employer/jobs/${job.id}/applicants`}
          className="text-xs font-bold text-blue-500 no-underline hover:text-blue-700 transition-colors"
        >
          Xem {job.application_count} ứng viên →
        </Link>
      </div>
    </div>
  )
}

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')

  const loadJobs = async () => {
    setLoading(true)
    const params = filterStatus !== 'all' ? { status: filterStatus } : {}
    const res = await employerService.getMyJobs(params)
    setJobs(res.data)
    setLoading(false)
  }

  useEffect(() => { loadJobs() }, [filterStatus])

  const handleDelete = async (id) => {
    await employerService.deleteJob(id)
    setJobs(prev => prev.filter(j => j.id !== id))
  }

  const handleStatusChange = async (id, status) => {
    const updated = await employerService.updateJobStatus(id, status)
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: updated.status } : j))
  }

  const filtered = filterStatus === 'all' ? jobs : jobs.filter(j => j.status === filterStatus)

  return (
    <div className="px-4 sm:px-6 py-8 max-w-[960px] mx-auto">
      {/* Action & Filter bar */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { key: 'all', label: 'Tất cả', count: jobs.length },
            { key: 'pending', label: 'Chờ duyệt', count: jobs.filter(j => j.status === 'pending').length },
            { key: 'active', label: 'Đang tuyển', count: jobs.filter(j => j.status === 'active').length },
            { key: 'draft', label: 'Bản nháp', count: jobs.filter(j => j.status === 'draft').length },
            { key: 'expired', label: 'Hết hạn', count: jobs.filter(j => j.status === 'expired').length },
            { key: 'closed', label: 'Đã đóng', count: jobs.filter(j => j.status === 'closed').length },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFilterStatus(tab.key)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                filterStatus === tab.key
                  ? 'bg-purple-100 text-[#7C3AED] font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {tab.label} {tab.count > 0 && <span className="font-extrabold">({tab.count})</span>}
            </button>
          ))}
        </div>
        <Link
          to="/employer/jobs/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl no-underline font-bold text-xs shadow-xs transition-all shrink-0 ml-auto"
        >
          <Plus size={15} /> Đăng tin mới
        </Link>
      </div>

      {loading ? (
        <SkeletonPage cards={3} cardType="job-card" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Chưa có tin tuyển dụng"
          description="Hãy đăng tin đầu tiên để tìm ứng viên phù hợp"
        />
      ) : (
        <div className="flex flex-col gap-3.5">
          {filtered.map(job => (
            <JobCard key={job.id} job={job} onDelete={handleDelete} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  )
}
