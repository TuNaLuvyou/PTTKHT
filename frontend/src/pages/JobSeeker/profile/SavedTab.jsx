import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Bookmark, BookmarkX, MapPin, Banknote, ArrowRight } from 'lucide-react'
import { jobService } from '@/services/jobService'

export function SavedTab() {
  const [saved, setSaved] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [removingId, setRemovingId] = useState(null)

  const fetchSaved = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await jobService.getSavedJobs()
      // Handle both direct array and axios-wrapped response
      const list = Array.isArray(data) ? data : (data?.data || [])
      setSaved(list)
    } catch (err) {
      console.error('[SavedTab.fetchSaved] Lỗi tải việc đã lưu:', err)
      setError('Không thể tải danh sách việc đã lưu. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSaved() }, [])

  const handleUnsave = async (jobId) => {
    try {
      setRemovingId(jobId)
      await jobService.toggleSaveJob(jobId)
      setSaved(prev => prev.filter(j => (j._id || j.id) !== jobId))
    } catch (err) {
      console.error('[SavedTab.handleUnsave] Lỗi bỏ lưu việc làm:', err)
      // item stays in list
    } finally {
      setRemovingId(null)
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
          onClick={fetchSaved}
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
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-[#0F172A]">Việc đã lưu</h2>
          <p className="text-xs text-slate-500 mt-0.5">{saved.length} công việc</p>
        </div>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#EEF2FF] text-[#1549B8] text-sm font-semibold hover:bg-[#E0E7FF] transition-colors"
        >
          Tìm việc
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {saved.length === 0 ? (
        <div className="bg-white rounded-3xl px-6 py-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] flex items-center justify-center mx-auto mb-4">
            <Bookmark className="h-6 w-6 text-[#1549B8]" />
          </div>
          <p className="font-bold text-[#0F172A]">Chưa lưu việc nào</p>
          <p className="text-sm text-slate-500 mt-1">Lưu việc làm để xem lại sau</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {saved.map(job => {
            const id = job._id || job.id
            const companyInit = (job.companyName || job.company || 'J').slice(0, 2).toUpperCase()
            return (
              <div
                key={id}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#EEF2FF] flex items-center justify-center font-black text-xs text-[#1549B8] shrink-0">
                    {companyInit}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#0F172A] truncate">{job.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {job.companyName || job.company}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnsave(id)}
                    disabled={removingId === id}
                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors disabled:opacity-50 shrink-0"
                    title="Bỏ lưu"
                    aria-label="Bỏ lưu"
                  >
                    {removingId === id
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <BookmarkX className="h-4 w-4" />}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {job.location && (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-slate-100 text-slate-600">
                      <MapPin className="h-3 w-3" />{job.location}
                    </span>
                  )}
                  {(job.salary || job.salaryRange) && (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold">
                      <Banknote className="h-3 w-3" />{job.salary || job.salaryRange}
                    </span>
                  )}
                  {job.type && (
                    <span className="text-[11px] px-2 py-1 rounded-lg bg-slate-100 text-slate-600">
                      {job.type}
                    </span>
                  )}
                </div>

                <Link
                  to={`/jobs/${id}`}
                  className="inline-flex items-center justify-center gap-1.5 h-9 rounded-xl bg-[#EEF2FF] text-[#1549B8] text-xs font-semibold hover:bg-[#E0E7FF] transition-colors"
                >
                  Xem việc
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
