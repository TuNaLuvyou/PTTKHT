import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Loader2, FileText, FileEdit, FileCheck, Eye, Trash2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cvService } from '@/services/cvService'
import CVScoreModal from '@/components/scoring/CVScoreModal'

// Utility to fix font encoding issues if the backend saved UTF-8 as latin1
function fixEncoding(str) {
  if (!str) return str;
  try {
    // If the string contains mojibake like "Nguyá»…n", escape and decodeURIComponent will fix it
    return decodeURIComponent(escape(str));
  }
  // Defensive: chuỗi không đúng encoding → trả về nguyên bản
  catch {
    return str; // Return original if not valid encoded string
  }
}

function normalizeCV(item) {
  return {
    _id: item._id,
    id: item.id,
    fileName: fixEncoding(item.fileName || item.cvUrl || 'CV'),
    overall: item.overall ?? item.analysis?.overall ?? item.score ?? 0,
    grade: item.grade || item.analysis?.grade || '-',
    gradeLabel: item.gradeLabel || item.analysis?.gradeLabel || '',
    jobTitle: item.jobId?.title || null,
    scoredAt: item.createdAt || item.analysis?.scoredAt,
    createdAt: item.createdAt,
  }
}

export function CVTab() {
  const { user } = useAuth()
  const [cvs, setCvs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCv, setSelectedCv] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)   // id đang xóa
  const [confirmDeleteId, setConfirmDeleteId] = useState(null) // id chờ xác nhận

  const draft = user?.cvBuilderData

  const fetchCVs = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await cvService.getMyCVs()
      setCvs(Array.isArray(data) ? data.map(normalizeCV) : [])
    } catch (err) {
      console.error('[CVTab.fetchCVs] Lỗi tải danh sách CV:', err)
      setError('Không thể tải danh sách CV. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCVs()
  }, [])

  const handleViewCV = async (cv) => {
    try {
      setDetailLoading(true)
      setShowModal(true)
      const data = await cvService.getCVScore(cv._id || cv.id)
      // getCVScore returns axios response, extract data
      const scoreData = data?.data?.data || data?.data || data
      setSelectedCv({
        ...scoreData,
        fileName: scoreData.fileName || cv.fileName,
        overall: scoreData.overall ?? scoreData.score ?? cv.overall,
        grade: scoreData.grade || cv.grade,
        gradeLabel: scoreData.gradeLabel || cv.gradeLabel,
      })
    } catch (err) {
      console.error('[CVTab.handleViewCV] Lỗi xem chi tiết điểm CV:', err)
      // If detail fetch fails, show what we have
      setSelectedCv({
        ...cv,
        categories: [],
        strengths: [],
        improvements: [],
      })
    } finally {
      setDetailLoading(false)
    }
  }

  const handleDeleteCV = async (id) => {
    try {
      setDeletingId(id)
      await cvService.deleteCVScore(id)
      setCvs(prev => prev.filter(cv => (cv._id || cv.id) !== id))
    } catch (err) {
      console.error('[CVTab.handleDeleteCV] Lỗi xóa CV:', err)
      setError('Xóa thất bại. Vui lòng thử lại.')
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-[#1549B8]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl px-6 py-12 text-center shadow-sm">
        <p className="text-sm text-rose-600 mb-4">{error}</p>
        <button
          onClick={fetchCVs}
          className="h-9 px-4 rounded-xl bg-[#EEF2FF] text-[#1549B8] text-sm font-semibold hover:bg-[#E0E7FF] transition-colors"
        >
          Thử lại
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-[#0F172A]">CV của tôi</h2>
          <p className="text-xs text-slate-500 mt-0.5">{cvs.length} CV đã phân tích</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/cv-upload"
            className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-[#EEF2FF] text-[#1549B8] text-sm font-semibold hover:bg-[#E0E7FF] transition-colors"
          >
            <FileCheck className="h-4 w-4" />
            Phân tích CV
          </Link>
          <Link
            to="/cv-builder"
            className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-[#1549B8] text-white text-sm font-semibold hover:bg-[#1240A0] transition-colors"
          >
            {draft?.personal?.name ? <FileEdit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {draft?.personal?.name ? 'Mở CV' : 'Tạo CV'}
          </Link>
        </div>
      </div>

      {/* Builder draft */}
      {draft?.personal?.name && (
        <div className="bg-[#0F172A] rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <span className="w-12 h-12 rounded-2xl bg-white/10 text-blue-200 flex items-center justify-center shrink-0">
            <FileEdit className="h-5 w-5" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-300">CV đã tạo</p>
            <p className="text-white font-bold mt-1 truncate">{draft.personal.name}</p>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              {draft.personal.title || 'Chưa có chức danh'}
            </p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/10 text-blue-200 shrink-0">
            Bản nháp
          </span>
        </div>
      )}

      {/* Analyzed CVs */}
      {cvs.length === 0 ? (
        <div className="bg-white rounded-3xl px-6 py-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] flex items-center justify-center mx-auto mb-4">
            <FileText className="h-6 w-6 text-[#1549B8]" />
          </div>
          <p className="font-bold text-[#0F172A]">Chưa có CV</p>
          <p className="text-sm text-slate-500 mt-1">Tạo CV mới hoặc tải CV để chấm điểm</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cvs.map(cv => {
            const id = cv._id || cv.id
            return (
              <div key={id} className="bg-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] flex flex-col items-center justify-center shrink-0">
                  <span className="text-lg font-black text-[#1549B8] leading-none">{cv.overall}</span>
                  <span className="text-[9px] font-bold text-[#1549B8]/60 mt-0.5">/100</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#0F172A] truncate">{cv.fileName}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#EEF2FF] text-[#1549B8]">
                      Loại {cv.grade || '-'}
                    </span>
                    {cv.gradeLabel && (
                      <span className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                        {cv.gradeLabel}
                      </span>
                    )}
                    {cv.jobTitle && (
                      <span className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 truncate max-w-45">
                        {cv.jobTitle}
                      </span>
                    )}
                    {cv.createdAt && (
                      <span className="text-[11px] text-slate-400">
                        {new Date(cv.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleViewCV(cv)}
                    disabled={detailLoading}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-[#EEF2FF] text-[#1549B8] text-xs font-semibold hover:bg-[#E0E7FF] transition-colors disabled:opacity-50"
                  >
                    <Eye className="h-3.5 w-3.5" />Xem
                  </button>

                  {confirmDeleteId === id ? (
                    <>
                      <button
                        onClick={() => handleDeleteCV(id)}
                        disabled={deletingId === id}
                        className="inline-flex items-center gap-1 h-9 px-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold hover:bg-rose-100 transition-colors disabled:opacity-50"
                      >
                        {deletingId === id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Xoá'}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="h-9 px-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                      >
                        Huỷ
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(id)}
                      className="w-9 h-9 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                      aria-label="Xoá CV"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Score Detail Modal */}
      <CVScoreModal
        open={showModal}
        onClose={() => { setShowModal(false); setSelectedCv(null) }}
        result={selectedCv}
      />
    </div>
  )
}
