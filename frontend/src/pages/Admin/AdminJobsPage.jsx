import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService } from '../../services/adminService'
import { connectSocket, onJobViewsUpdated, onJobApplicationsUpdated } from '../../services/socket'
import {
  Search, Building2, CheckCircle2, PauseCircle, RefreshCw,
  Ban, Trash2, CircleAlert, CircleCheck, CircleX, ClipboardList,
  DollarSign, BarChart3, FolderOpen, Briefcase, AlertTriangle, X, Bookmark
} from 'lucide-react'
import EmptyState from '@/components/common/EmptyState'
import { SkeletonPage } from '@/components/common/Skeleton'

/* ── Configs ───────────────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  active:   { label: 'Đang tuyển', cls: 'text-emerald-600 bg-emerald-100 border-emerald-200' },
  pending:  { label: 'Chờ duyệt',  cls: 'text-amber-600 bg-amber-100 border-amber-200' },
  reported: { label: 'Bị báo cáo', cls: 'text-red-600 bg-red-100 border-red-200' },
  closed:   { label: 'Đã đóng',    cls: 'text-slate-400 bg-slate-100 border-slate-200' },
}

const TABS = [
  { key: 'all',      label: 'Tất cả' },
  { key: 'pending',  label: 'Chờ duyệt', icon: CircleAlert },
  { key: 'active',   label: 'Đang tuyển', icon: CircleCheck },
  { key: 'reported', label: 'Bị báo cáo', icon: CircleX },
  { key: 'closed',   label: 'Đã đóng', icon: PauseCircle },
]

/* ── Job Card ──────────────────────────────────────────────────────────────── */
function AdminJobCard({ job, onStatusChange, onDelete, onToggleFeatured }) {
  const navigate = useNavigate()
  const [actionLoading, setActionLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.active

  const handleAction = async (action, ...args) => {
    setActionLoading(true)
    try { await action(...args) }
    finally { setActionLoading(false); setMenuOpen(false) }
  }

  const JOB_INFO_ICONS = [
    { icon: DollarSign, text: job.salary },
    { icon: BarChart3, text: job.level },
    { icon: FolderOpen, text: job.category },
    { icon: Briefcase, text: job.type },
  ]

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-5 transition-shadow ${actionLoading ? 'opacity-60' : ''}`}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
    >
      <div className="flex justify-between items-start gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          {/* Title + status */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h3 className="text-[15px] font-bold text-slate-900 m-0">{job.title}</h3>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${cfg.cls}`}>
              {cfg.label}
            </span>
            {job.featured && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 inline-flex items-center gap-1">
                <Bookmark size={12} fill="#D97706" /> Nổi bật
              </span>
            )}
          </div>

          {/* Company + meta */}
          <p className="text-[13px] text-slate-600 font-medium mb-2 flex items-center gap-1">
            <Building2 size={14} className="text-slate-400 shrink-0" /> {job.company} <span className="text-slate-400 ml-1">· {job.location}</span>
          </p>

          <div className="flex flex-wrap gap-3 mb-2">
            {JOB_INFO_ICONS.map(item => {
              const ItemIcon = item.icon
              return (
                <span key={item.text} className="text-xs text-slate-500 flex items-center gap-1">
                  <ItemIcon size={14} className="text-slate-400 shrink-0" /> {item.text}
                </span>
              )
            })}
          </div>

          {/* Tags */}
          {job.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {job.tags.map(tag => (
                <span key={tag} className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200 font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Report warning */}
          {job.reportCount > 0 && (
            <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-1.5">
              <AlertTriangle size={14} className="shrink-0" />
              <span><strong>{job.reportCount} lượt báo cáo</strong> từ người dùng</span>
            </div>
          )}
        </div>

        {/* Stats + Actions */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-center">
            <div className="text-lg font-black text-slate-900">{job.applied}</div>
            <div className="text-[11px] text-slate-400">Ứng tuyển</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black text-slate-900">{job.views}</div>
            <div className="text-[11px] text-slate-400">Lượt xem</div>
          </div>

          {/* Action menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="bg-slate-50 border border-slate-200 rounded-lg w-9 h-9 cursor-pointer text-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
            >⋯</button>
            {menuOpen && (
              <div
                className="absolute right-0 top-11 z-50 bg-white rounded-xl border border-slate-200 shadow-xl min-w-50 overflow-hidden"
                onMouseLeave={() => setMenuOpen(false)}
              >
                {job.status === 'pending' && (
                  <MenuBtn icon={<CheckCircle2 size={14} />} label="Duyệt tin" onClick={() => handleAction(onStatusChange, job.id, 'active')} />
                )}
                {job.status === 'active' && (
                  <MenuBtn icon={<PauseCircle size={14} />} label="Đóng tin" onClick={() => handleAction(onStatusChange, job.id, 'closed')} />
                )}
                {job.status === 'closed' && (
                  <MenuBtn icon={<RefreshCw size={14} />} label="Mở lại" onClick={() => handleAction(onStatusChange, job.id, 'active')} />
                )}
                {job.status === 'reported' && (
                  <>
                    <MenuBtn icon={<CheckCircle2 size={14} />} label="Bỏ qua báo cáo" onClick={() => handleAction(onStatusChange, job.id, 'active')} />
                    <MenuBtn icon={<Ban size={14} />} label="Gỡ tin" onClick={() => handleAction(onStatusChange, job.id, 'closed')} danger />
                  </>
                )}
                <MenuBtn
                  icon={job.featured ? <Bookmark size={14} fill="#D97706" /> : <Bookmark size={14} />}
                  label={job.featured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
                  onClick={() => handleAction(onToggleFeatured, job.id, !job.featured)}
                />
                <div className="border-t border-slate-100" />
                <MenuBtn icon={<Trash2 size={14} />} label="Xóa vĩnh viễn" danger onClick={() => {
                  if (confirm(`Xóa vĩnh viễn tin "${job.title}"?`)) handleAction(onDelete, job.id)
                }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 mt-3.5 pt-3 flex justify-between items-center flex-wrap gap-2">
        <span className="text-xs text-slate-400">
          Đăng {new Date(job.postedAt).toLocaleDateString('vi-VN')}
          {job.deadline && ` · Hạn ${new Date(job.deadline).toLocaleDateString('vi-VN')}`}
        </span>
        <button
          onClick={() => navigate(`/admin/jobs/${job.id}`)}
          className="text-xs font-bold text-blue-500 bg-transparent border-none cursor-pointer font-[inherit] hover:text-blue-700 transition-colors"
        >
          Chi tiết →
        </button>
      </div>
    </div>
  )
}

/* ── Reusable menu button ──────────────────────────────────────────────────── */
function MenuBtn({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-2.5 bg-transparent border-none cursor-pointer text-[13px] font-medium text-left flex items-center gap-2.5 font-[inherit] transition-colors duration-150 ${danger ? 'text-red-500 hover:bg-red-50' : 'text-slate-900 hover:bg-slate-50'}`}
    >
      <span className={`w-4 inline-flex justify-center shrink-0 ${danger ? 'text-red-500' : 'text-slate-400'}`}>{icon}</span>
      {label}
    </button>
  )
}

/* ── Main Page ─────────────────────────────────────────────────────────────── */
export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadJobs = async () => {
    setLoading(true)
    try {
      const params = {}
      if (activeTab !== 'all') params.status = activeTab
      if (search) params.keyword = search
      const res = await adminService.getJobs(params)
      setJobs(res.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { loadJobs() }, [activeTab])

  // Realtime: listen for view count & application count updates via WebSocket
  useEffect(() => {
    connectSocket()
    const cleanupViews = onJobViewsUpdated(({ jobId, views }) => {
      setJobs(prev => prev.map(j =>
        j.id === jobId ? { ...j, views } : j
      ))
    })
    const cleanupApps = onJobApplicationsUpdated(({ jobId, applied }) => {
      setJobs(prev => prev.map(j =>
        j.id === jobId ? { ...j, applied } : j
      ))
    })
    return () => {
      cleanupViews()
      cleanupApps()
    }
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    loadJobs()
  }

  const handleStatusChange = async (id, newStatus) => {
    await adminService.updateJobStatus(id, newStatus)
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: newStatus } : j))
    const labels = { active: 'Đã duyệt', closed: 'Đã đóng' }
    showToast(`${labels[newStatus] || 'Cập nhật'} tin thành công`)
  }

  const handleDelete = async (id) => {
    await adminService.deleteJob(id)
    setJobs(prev => prev.filter(j => j.id !== id))
    showToast('Đã xóa tin tuyển dụng')
  }

  const handleToggleFeatured = async (id, featured) => {
    await adminService.toggleJobFeatured(id, featured)
    setJobs(prev => prev.map(j => j.id === id ? { ...j, featured } : j))
    showToast(featured ? 'Đã đánh dấu nổi bật' : 'Đã bỏ nổi bật')
  }

  const pendingCount = jobs.filter(j => j.status === 'pending').length
  const reportedCount = jobs.filter(j => j.status === 'reported').length

  return (
    <div className="p-6 max-w-240 mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 mb-1">Quản lý tin tuyển dụng</h1>
        <p className="text-[13px] text-slate-500 m-0">
          Duyệt, quản lý và kiểm soát chất lượng tin đăng từ nhà tuyển dụng
        </p>
      </div>

      {/* Quick stats */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {[
          { label: 'Tổng tin', value: jobs.length, cls: 'text-[#1549B8] bg-[#EEF2FF]' },
          { label: 'Chờ duyệt', value: pendingCount, cls: 'text-amber-600 bg-amber-100' },
          { label: 'Bị báo cáo', value: reportedCount, cls: 'text-red-600 bg-red-100' },
        ].map(s => (
          <div key={s.label} className="flex-1 min-w-30 bg-white rounded-xl border border-slate-200 p-3.5 text-center">
            <div className={`text-[22px] font-black ${s.cls}`}>{s.value}</div>
            <div className="text-xs text-slate-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên tin hoặc công ty..."
            className="w-full py-2 pl-9 pr-3.5 rounded-xl border-2 border-slate-200 text-[13px] font-[inherit] outline-none box-border focus:border-blue-500 transition-colors"
          />
        </div>
        <button type="submit" className="px-4.5 py-2 rounded-xl border-none bg-[#1549B8] text-white font-bold text-[13px] cursor-pointer font-[inherit] flex items-center gap-1.5 hover:bg-[#1240A0] transition-colors">
          <Search size={14} /> Tìm
        </button>
      </form>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map(tab => {
          const TabIcon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-semibold border-2 cursor-pointer font-[inherit] inline-flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              {TabIcon && <TabIcon size={14} />}
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`mb-4 px-4 py-2.5 rounded-xl text-[13px] font-semibold border-2 flex items-center gap-2 ${
          toast.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-600'
            : 'bg-green-50 border-green-200 text-green-600'
        }`}>
          {toast.type === 'error' ? <X size={14} /> : <CheckCircle2 size={14} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Job list */}
      {loading ? (
        <SkeletonPage cards={4} cardType="job-card" />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Không có tin tuyển dụng nào"
          description={activeTab === 'pending' ? 'Không có tin nào chờ duyệt' : 'Chưa có tin nào trong danh mục này'}
          className="rounded-2xl border border-slate-200"
        />
      ) : (
        <div className="flex flex-col gap-3.5">
          {jobs.map(job => (
            <AdminJobCard
              key={job.id}
              job={job}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onToggleFeatured={handleToggleFeatured}
            />
          ))}
        </div>
      )}
    </div>
  )
}
