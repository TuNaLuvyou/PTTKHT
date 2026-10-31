import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import { 
  FileText, Search, Trash2, 
  Clock, FileSearch, MoreHorizontal,
  Briefcase, Eye, AlertTriangle,
  RefreshCw
} from 'lucide-react'
import EmptyState from '@/components/common/EmptyState'
import { connectSocket, onDashboardUpdateNeeded } from '../../services/socket.js'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Spinner from '@/components/common/Spinner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// API base URL for debugging display
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const GRADE_CONFIG = {
  A: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  B: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  C: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  D: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
}

export default function AdminCVScoresPage() {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [search, setSearch] = useState('')
  const [activeGrade, setActiveGrade] = useState('all')
  const [menuOpenId, setMenuOpenId] = useState(null)
  const [detailScore, setDetailScore] = useState(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  const fetchScores = async (keyword, grade) => {
    setLoading(true)
    setFetchError(null)
    try {
      const params = {}
      if (keyword || search) params.keyword = keyword || search
      if ((grade || activeGrade) !== 'all') params.grade = grade || activeGrade
      const res = await adminService.getCVScores(params)
      setScores(res.data)
    } catch (err) {
      console.error('Lỗi tải lịch sử chấm CV:', err)
      const message = err?.message || 'Không thể kết nối đến máy chủ'
      setFetchError(message)
      setScores([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScores()
  }, [activeGrade])

  // Realtime sync: refetch when dashboard data changes (new CV scores, etc.)
  useEffect(() => {
    connectSocket()
    const cleanup = onDashboardUpdateNeeded(() => fetchScores(search, activeGrade))
    return cleanup
  }, [search, activeGrade])

  // Compute average score from the loaded scores
  const filteredScores = scores.filter(s => s.overall != null)
  const avgScore = filteredScores.length > 0
    ? (filteredScores.reduce((sum, s) => sum + Number(s.overall), 0) / filteredScores.length).toFixed(1)
    : '—'

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa lịch sử chấm điểm này?')) return
    try {
      await adminService.deleteCVScore(id)
      setScores(scores.filter(s => s.id !== id))
    } catch (err) {
      console.error('Lỗi xóa điểm CV:', err)
      alert('Không thể xóa điểm CV. Vui lòng thử lại sau.')
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Lịch sử chấm CV</h1>
          <p className="text-slate-500 mt-1 text-sm">Theo dõi chất lượng CV và hiệu suất của công cụ AI chấm điểm</p>
        </div>
        <div className="bg-white p-1 rounded-2xl border border-slate-200 flex gap-1 w-full sm:w-auto">
          {['all', 'A', 'B', 'C', 'D'].map(grade => (
            <button
              key={grade}
              onClick={() => setActiveGrade(grade)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeGrade === grade 
                ? 'bg-[#1549B8] text-white shadow-lg shadow-blue-200' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {grade === 'all' ? 'Tất cả' : `Hạng ${grade}`}
            </button>
          ))}
        </div>
      </div>

      {/* Filters & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="lg:col-span-3 flex flex-col sm:flex-row gap-3">
          <div className="relative flex items-center flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-slate-400" size={18} />
            </div>
            <input 
              type="text"
              placeholder="Tìm kiếm ứng viên, email hoặc file..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchScores()}
            />
          </div>
          <Button onClick={fetchScores} className="rounded-2xl px-8 bg-[#1549B8] hover:bg-[#1e40af] font-bold w-full sm:w-auto">
            Tìm kiếm
          </Button>
        </div>
        <div className="bg-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-200">
          <div className="text-[10px] font-bold uppercase opacity-80">Điểm trung bình</div>
          <div className="text-2xl font-black mt-0.5">{avgScore}</div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-visible hidden md:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Ứng viên</th>
              <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">File & Vị trí</th>
              <th className="px-6 py-4 text-center text-[11px] font-black text-slate-400 uppercase tracking-wider">Điểm / Hạng</th>
              <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Thời gian chấm</th>
              <th className="px-6 py-4 text-right text-[11px] font-black text-slate-400 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-20 text-center">
                  <Spinner size="lg" color="blue" text="Đang tải lịch sử..." />
                </td>
              </tr>
            ) : fetchError ? (
              <tr>
                <td colSpan="5" className="py-16 text-center">
                  <AlertTriangle className="w-12 h-12 text-red-200 mx-auto mb-4" />
                  <div className="text-slate-800 font-bold mb-2">Không thể tải dữ liệu</div>
                  <div className="text-sm text-slate-400 max-w-md mx-auto mb-4 leading-relaxed">
                    {fetchError.includes('401') || fetchError.includes('403') ? (
                      'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
                    ) : fetchError.includes('Network') || fetchError.includes('Failed to fetch') ? (
                      <span>
                        Máy chủ backend không phản hồi. Hãy đảm bảo backend đang chạy và kiểm tra biến môi trường{' '}
                        <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 text-xs">VITE_API_URL</code>
                        {' '}(hiện tại: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 text-xs">{API_URL}</code>).
                      </span>
                    ) : (
                      fetchError
                    )}
                  </div>
                  <Button onClick={fetchScores} className="rounded-2xl bg-[#1549B8] hover:bg-[#1e40af] font-bold gap-2">
                    <RefreshCw size={15} /> Thử lại
                  </Button>
                </td>
              </tr>
            ) : scores.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-20 text-center">
                  <EmptyState icon={FileSearch} title="Không tìm thấy kết quả nào" />
                </td>
              </tr>
            ) : (
              scores.map(s => {
                const cfg = GRADE_CONFIG[s.grade] || GRADE_CONFIG.B
                return (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs uppercase">
                          {s.userName.split(' ').pop()[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{s.userName}</div>
                          <div className="text-xs text-slate-400">{s.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-[#1549B8] font-semibold text-[13px] mb-1">
                        <FileText size={14} />
                        {s.fileName}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Briefcase size={12} className="text-slate-400" />
                        Vị trí: {s.targetPosition || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="inline-flex flex-col items-center">
                        <div className="text-lg font-black text-slate-900 leading-none">{s.overall}</div>
                        <Badge className={`${cfg.bg} ${cfg.color} ${cfg.border} border text-[10px] py-0 px-2 mt-1.5`}>
                          Hạng {s.grade}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[13px] text-slate-600 font-medium">
                        {new Date(s.scoredAt).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock size={12} /> {s.processingTime} giây
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <div className="relative">
                           <button
                             onClick={() => setMenuOpenId(menuOpenId === s.id ? null : s.id)}
                             className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 text-slate-400 hover:text-[#1549B8] transition-all"
                           >
                             <MoreHorizontal size={18} />
                           </button>
                           {menuOpenId === s.id && (
                             <div
                               className="absolute right-0 top-10 z-50 bg-white rounded-xl border border-slate-200 shadow-xl min-w-[160px] overflow-hidden"
                               onMouseLeave={() => setMenuOpenId(null)}
                             >
                               <button
                                 onClick={() => { setDetailScore(s); setShowDetailDialog(true); setMenuOpenId(null) }}
                                 className="w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
                               >
                                 <Eye size={14} className="text-slate-400" />
                                 Xem chi tiết
                               </button>
                             </div>
                           )}
                         </div>
                         <button 
                           onClick={() => handleDelete(s.id)}
                           className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-red-100 text-slate-400 hover:text-red-600 transition-all"
                         >
                           <Trash2 size={18} />
                         </button>
                       </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="py-20 text-center">
            <Spinner size="lg" color="blue" text="Đang tải lịch sử..." />
          </div>
        ) : fetchError ? (
          <div className="py-12 text-center bg-white rounded-[24px] border border-slate-200">
            <AlertTriangle className="w-10 h-10 text-red-200 mx-auto mb-3" />
            <div className="text-slate-800 font-bold mb-1">Không thể tải dữ liệu</div>
            <p className="text-sm text-slate-400 max-w-xs mx-auto mb-4">
              {fetchError.includes('401') || fetchError.includes('403')
                ? 'Phiên đăng nhập hết hạn.'
                : fetchError.includes('Network') || fetchError.includes('Failed to fetch')
                  ? 'Máy chủ backend không phản hồi.'
                  : fetchError}
            </p>
            <Button onClick={fetchScores} className="rounded-2xl bg-[#1549B8] hover:bg-[#1e40af] font-bold gap-2 text-sm">
              <RefreshCw size={14} /> Thử lại
            </Button>
          </div>
        ) : scores.length === 0 ? (
          <EmptyState icon={FileSearch} title="Không tìm thấy kết quả nào" />
        ) : (
          scores.map(s => {
            const cfg = GRADE_CONFIG[s.grade] || GRADE_CONFIG.B
            return (
              <div key={s.id} className="bg-white rounded-[24px] border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs uppercase">
                    {s.userName.split(' ').pop()[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 text-sm truncate">{s.userName}</div>
                    <div className="text-xs text-slate-400 truncate">{s.userEmail}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-slate-900 leading-none">{s.overall}</div>
                    <Badge className={`${cfg.bg} ${cfg.color} ${cfg.border} border text-[10px] py-0 px-2 mt-1`}>
                      Hạng {s.grade}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[#1549B8] font-semibold text-[13px] mb-2">
                  <FileText size={14} />
                  <span className="truncate">{s.fileName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={12} /> {new Date(s.scoredAt).toLocaleDateString('vi-VN')} · {s.processingTime}s
                  </div>
                  <div className="flex gap-1">
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === s.id ? null : s.id)}
                        className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-[#1549B8] transition-all"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {menuOpenId === s.id && (
                        <div
                          className="absolute right-0 top-9 z-50 bg-white rounded-xl border border-slate-200 shadow-xl min-w-[160px] overflow-hidden"
                          onMouseLeave={() => setMenuOpenId(null)}
                        >
                          <button
                            onClick={() => { setDetailScore(s); setShowDetailDialog(true); setMenuOpenId(null) }}
                            className="w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Eye size={14} className="text-slate-400" />
                            Xem chi tiết
                          </button>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => handleDelete(s.id)}
                      className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-600 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Score Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={(open) => { if (!open) { setShowDetailDialog(false); setDetailScore(null) } }}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">Chi tiết điểm CV</DialogTitle>
          </DialogHeader>
          {detailScore && (
            <div className="space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-black text-xs uppercase">
                  {detailScore.userName?.split(' ').pop()?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 text-sm">{detailScore.userName}</div>
                  <div className="text-xs text-slate-400">{detailScore.userEmail}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-slate-900">{detailScore.overall}</div>
                  <Badge className={`${(GRADE_CONFIG[detailScore.grade] || GRADE_CONFIG.B).bg} ${(GRADE_CONFIG[detailScore.grade] || GRADE_CONFIG.B).color} border text-[10px] py-0 px-2`}>
                    Hạng {detailScore.grade}
                  </Badge>
                </div>
              </div>

              {/* File Info */}
              <div className="flex items-center gap-2 text-[#1549B8] font-semibold text-sm">
                <FileText size={14} />
                <span className="truncate">{detailScore.fileName}</span>
              </div>
              {detailScore.targetPosition && (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Briefcase size={14} className="text-slate-400" />
                  Vị trí: {detailScore.targetPosition}
                </div>
              )}

              {/* Category Breakdown */}
              {detailScore.categories && Object.keys(detailScore.categories).length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-slate-700">Phân tích theo tiêu chí</h4>
                  {Object.entries(detailScore.categories).map(([key, score]) => {
                    const catColor = score >= 80 ? '#10B981' : score >= 65 ? '#3B82F6' : score >= 50 ? '#F59E0B' : '#EF4444'
                    const labels = { skills: 'Kỹ năng', experience: 'Kinh nghiệm', education: 'Học vấn', format: 'Định dạng', keywords: 'Từ khóa' }
                    return (
                      <div key={key}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-slate-600">{labels[key] || key}</span>
                          <span className="text-sm font-bold" style={{ color: catColor }}>{score}/100</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, score))}%`, backgroundColor: catColor }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Time Info */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {detailScore.scoredAt ? new Date(detailScore.scoredAt).toLocaleDateString('vi-VN') : '—'}
                </span>
                <span>{detailScore.processingTime} giây xử lý</span>
              </div>
            </div>
          )}
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => { setShowDetailDialog(false); setDetailScore(null) }} className="rounded-xl">
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
