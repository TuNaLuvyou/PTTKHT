import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminService } from '../../services/adminService'
import { 
  ArrowLeft, Building, MapPin, Briefcase, DollarSign, 
  Clock, CheckCircle2, XCircle, Calendar,
  FileText, PlusCircle, Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Skeleton from '@/components/common/Skeleton'

const STATUS_CONFIG = {
  active:   { label: 'Đang tuyển', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  pending:  { label: 'Chờ duyệt',  color: 'text-amber-700', bg: 'bg-amber-50' },
  reported: { label: 'Bị báo cáo', color: 'text-red-700', bg: 'bg-red-50' },
  closed:   { label: 'Đã đóng',    color: 'text-slate-600', bg: 'bg-slate-100' },
}

export default function AdminJobDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchJob = useCallback(async () => {
    try {
      const res = await adminService.getJobs()
      const found = res.data.find(j => j.id == id)
      if (found) setJob(found)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchJob()
  }, [fetchJob])

  const handleStatusChange = async (newStatus) => {
    setActionLoading(true)
    try {
      await adminService.updateJobStatus(id, newStatus)
      setJob(prev => ({ ...prev, status: newStatus }))
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Skeleton variant="subtitle" className="w-32" />
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 p-8 space-y-4">
          <Skeleton variant="badge" className="bg-slate-600" />
          <Skeleton variant="title" className="w-2/3 bg-slate-600" />
          <div className="flex gap-6">
            <Skeleton variant="subtitle" className="w-32 bg-slate-600" />
            <Skeleton variant="subtitle" className="w-40 bg-slate-600" />
            <Skeleton variant="subtitle" className="w-36 bg-slate-600" />
          </div>
        </div>
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <Skeleton key={i} variant="chart" className="h-28" />)}
          </div>
          <Skeleton variant="chart" className="h-40" />
          <Skeleton variant="chart" className="h-32" />
        </div>
      </div>
    </div>
  )
  if (!job) return (
    <div className="p-12 text-center">
      <h2 className="text-xl font-bold text-slate-900">Không tìm thấy tin tuyển dụng</h2>
      <Button variant="link" onClick={() => navigate('/admin/jobs')}>Quay lại danh sách</Button>
    </div>
  )

  const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.active

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header / Breadcrumb */}
      <button 
        onClick={() => navigate('/admin/jobs')}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#1549B8] transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Quay lại danh sách
      </button>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner Section */}
        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <span className={`${cfg.bg} ${cfg.color} text-xs font-bold px-3 py-1 rounded-xl`}>
                        {cfg.label}
                    </span>
                    {job.featured && (
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-xl">
                            Nổi bật
                        </span>
                    )}
                </div>
                <h1 className="text-3xl font-black mb-4 leading-tight">{job.title}</h1>
                <div className="flex flex-wrap gap-6 text-slate-300">
                    <div className="flex items-center gap-2">
                        <Building size={18} className="text-slate-400" />
                        <span className="font-medium">{job.company}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-slate-400" />
                        <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={18} className="text-slate-400" />
                        <span>Đăng ngày {new Date(job.postedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                </div>
            </div>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        </div>

        <div className="p-8">
            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'Mức lương', value: job.salary, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Kinh nghiệm', value: job.level, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Loại hình', value: job.type, icon: Clock, color: 'text-violet-600', bg: 'bg-violet-50' },
                    { label: 'Hết hạn', value: job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : 'Vô thời hạn', icon: Calendar, color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map((item, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30">
                        <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-3`}>
                            <item.icon size={20} />
                        </div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</div>
                        <div className="text-sm font-black text-slate-900 mt-0.5">{item.value}</div>
                    </div>
                ))}
            </div>

            {/* Content sections */}
            <div className="space-y-8">
                <section>
                    <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-[#1549B8]" /> Chi tiết công việc
                    </h3>
                    <div className="text-slate-600 leading-relaxed whitespace-pre-wrap pl-7 text-[14px]">
                        {job.description || 'Chưa có mô tả chi tiết'}
                    </div>
                </section>

                {/* Skills section */}
                {job.tags && job.tags.length > 0 && (
                    <section>
                        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                            <Tag size={20} className="text-blue-500" /> Kỹ năng yêu cầu
                        </h3>
                        <div className="pl-7 flex flex-wrap gap-2">
                            {job.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-blue-50 text-[#1549B8] rounded-xl text-xs font-semibold">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                <div className="grid md:grid-cols-2 gap-10">
                    <section>
                        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                            <CheckCircle2 size={20} className="text-emerald-500" /> Yêu cầu ứng viên
                        </h3>
                        <div className="text-slate-600 leading-relaxed whitespace-pre-wrap pl-7 text-[14px]">
                            {Array.isArray(job.requirements) 
                                ? job.requirements.map((r, i) => <div key={i}>• {r}</div>) 
                                : (job.requirements || 'Chưa có yêu cầu')}
                        </div>
                    </section>
                    <section>
                        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                            <PlusCircle size={20} className="text-violet-500" /> Quyền lợi
                        </h3>
                        <div className="text-slate-600 leading-relaxed whitespace-pre-wrap pl-7 text-[14px]">
                            {Array.isArray(job.benefits) 
                                ? job.benefits.map((b, i) => <div key={i}>• {b}</div>) 
                                : (job.benefits || 'Chưa có quyền lợi')}
                        </div>
                    </section>
                </div>
            </div>

            {/* Admin Actions */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
                <div>
                    <h4 className="font-bold text-slate-900">Trạng thái hiện tại: {cfg.label}</h4>
                    <p className="text-xs text-slate-400 mt-1">Lần cập nhật cuối: {new Date().toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="flex gap-3">
                    {job.status === 'pending' || job.status === 'reported' ? (
                        <>
                            <Button 
                                variant="outline" 
                                className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 px-6 font-bold"
                                onClick={() => handleStatusChange('closed')}
                                disabled={actionLoading}
                            >
                                <XCircle className="w-4 h-4 mr-2" /> Từ chối
                            </Button>
                            <Button 
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-8 font-bold shadow-lg shadow-emerald-200"
                                onClick={() => handleStatusChange('active')}
                                disabled={actionLoading}
                            >
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Duyệt tin này
                            </Button>
                        </>
                    ) : job.status === 'active' ? (
                        <Button 
                            variant="outline" 
                            className="rounded-xl px-6 font-bold"
                            onClick={() => handleStatusChange('closed')}
                            disabled={actionLoading}
                        >
                            <Clock className="w-4 h-4 mr-2" /> Đóng tin tuyển dụng
                        </Button>
                    ) : (
                        <Button 
                            className="rounded-xl bg-[#1549B8] hover:bg-[#1e40af] text-white px-8 font-bold"
                            onClick={() => handleStatusChange('active')}
                            disabled={actionLoading}
                        >
                            Mở lại tin tuyển dụng
                        </Button>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
