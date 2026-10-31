import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Bot, Search, Inbox, Users, Trash2 } from 'lucide-react'
import EmptyState from '@/components/common/EmptyState'
import { SkeletonPage } from '@/components/common/Skeleton'
import { employerService } from '../../services/employerService'
import ApplicantCard from './components/ApplicantCard'
import ScoringModal from './components/ScoringModal'

const STATUS_CONFIG = {
  pending: { label: 'Chờ xem', color: '#F59E0B', bg: '#FEF3C7', next: 'reviewing' },
  reviewing: { label: 'Đang xét', color: '#3B82F6', bg: '#DBEAFE', next: 'interview' },
  interview: { label: 'Phỏng vấn', color: '#8B5CF6', bg: '#EDE9FE', next: 'offered' },
  offered: { label: 'Đã offer', color: '#10B981', bg: '#D1FAE5', next: null },
  rejected: { label: 'Từ chối', color: '#EF4444', bg: '#FEE2E2', next: null },
}

export default function EmployerApplicantsPage() {
  const { id: jobId } = useParams()
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [jobTitle, setJobTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('score')
  const [search, setSearch] = useState('')

  // Scoring Modal state
  const [showScoringModal, setShowScoringModal] = useState(false)
  const [scoringFile, setScoringFile] = useState(null)
  const [scoringLoading, setScoringLoading] = useState(false)
  const [scoringResult, setScoringResult] = useState(null)
  const [scoringError, setScoringError] = useState('')
  const [scoringTargetApplicant, setScoringTargetApplicant] = useState(null)

  // Selection & deletion
  const [selectedIds, setSelectedIds] = useState([])

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map(app => app.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleDeleteOne = async (appId, candidateName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ ứng tuyển của "${candidateName || 'Ứng viên'}" không?`)) {
      return
    }
    try {
      await employerService.deleteApplication(appId)
      setApplications(prev => prev.filter(app => app.id !== appId))
      setSelectedIds(prev => prev.filter(id => id !== appId))
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Lỗi khi xóa hồ sơ')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} hồ sơ đã chọn không?`)) {
      return
    }
    try {
      await employerService.bulkDeleteApplications(selectedIds)
      setApplications(prev => prev.filter(app => !selectedIds.includes(app.id)))
      setSelectedIds([])
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Lỗi khi xóa hàng loạt hồ sơ')
    }
  }

  useEffect(() => {
    Promise.all([
      employerService.getApplications(jobId),
      employerService.getJob(jobId),
    ]).then(([appRes, job]) => {
      setApplications(appRes.data)
      setJobTitle(job.title)
      setLoading(false)
    })
  }, [jobId])

  const handleStatusChange = async (appId, newStatus) => {
    await employerService.updateApplicationStatus(appId, newStatus)
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a))
  }

  const filtered = applications
    .filter(a => filterStatus === 'all' || a.status === filterStatus)
    .filter(a => {
      if (!search) return true
      const term = search.toLowerCase()
      return (
        a.candidate_name?.toLowerCase().includes(term) ||
        a.candidate_email?.toLowerCase().includes(term) ||
        a.seeker?.full_name?.toLowerCase().includes(term) ||
        a.seeker?.email?.toLowerCase().includes(term)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'score') {
        const scoreDiff = (b.ai_score?.overall_score || 0) - (a.ai_score?.overall_score || 0)
        if (scoreDiff !== 0) return scoreDiff
        return new Date(b.applied_at) - new Date(a.applied_at)
      }
      return new Date(b.applied_at) - new Date(a.applied_at)
    })

  const handleScoreCv = async () => {
    if (!scoringFile && !scoringTargetApplicant) {
      setScoringError('Vui lòng chọn file PDF CV')
      return
    }
    setScoringError('')
    setScoringLoading(true)
    setScoringResult(null)

    try {
      const candidateId = scoringTargetApplicant?.seeker_id || scoringTargetApplicant?.seeker?.id || scoringTargetApplicant?.seeker?._id
      const res = await employerService.scoreCv(jobId, scoringFile || null, candidateId)
      setScoringResult(res.data)

      const appRes = await employerService.getApplications(jobId)
      setApplications(appRes.data)
    } catch (err) {
      setScoringError(err.response?.data?.message || err.message || 'Lỗi khi chấm điểm CV')
    } finally {
      setScoringLoading(false)
    }
  }

  return (
    <div className="p-[32px_16px] max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start flex-wrap gap-3">
        <div>
          <button
            onClick={() => navigate('/employer/jobs')}
            className="bg-none border-none cursor-pointer text-muted-foreground text-sm font-semibold p-0 mb-3 flex items-center gap-1.5 hover:text-[#0F172A] transition-colors"
          >
            ← Quay lại danh sách tin
          </button>
          <h1 className="text-[22px] font-black text-[#0F172A] mb-1 flex items-center gap-2">
            <Users size={20} /> Ứng viên — {jobTitle}
          </h1>
          <p className="text-xs text-muted-foreground">{applications.length} hồ sơ ứng tuyển</p>
        </div>
        <button
          onClick={() => {
            setScoringTargetApplicant(null)
            setShowScoringModal(true)
          }}
          className="px-7 py-[14px] rounded-xl border-none text-white cursor-pointer text-[15px] font-extrabold uppercase tracking-wide flex items-center gap-2.5 transition-all duration-300 hover:-translate-y-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/50"
        >
          <Bot size={20} />
          <span>Chấm Điểm CV Bằng AI</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-wrap gap-4 mb-5">
        <div className="relative flex-1 min-w-[300px] w-full">
          <Search size={16} className="absolute left-[14px] top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm ứng viên theo tên hoặc email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full p-[12px_14px_12px_42px] border border-border rounded-xl text-sm text-[#0F172A] outline-none transition-all duration-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 box-border"
          />
        </div>
      </div>

      {/* Filter + Sort */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2.5">
        <div className="flex gap-1.5 flex-wrap">
          {[
            { key: 'all', label: `Tất cả (${applications.length})` },
            ...Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({ key, label: cfg.label })),
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-[14px] py-[6px] rounded-full text-xs font-semibold border cursor-pointer transition-all ${
                filterStatus === tab.key
                  ? 'bg-blue-50 text-blue-600 border-blue-500'
                  : 'bg-white text-muted-foreground border-border hover:border-blue-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-3 py-[7px] rounded-lg border border-border text-xs text-[#0F172A] bg-white cursor-pointer outline-none focus:border-blue-500"
        >
          <option value="score">Sắp xếp: AI Score cao nhất</option>
          <option value="date">Sắp xếp: Mới nhất</option>
        </select>
      </div>

      {loading ? (
        <SkeletonPage cards={4} cardType="job-card" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Chưa có ứng viên nào"
          description="Hãy chờ ứng viên nộp hồ sơ nhé!"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {/* Bulk selection bar */}
          <div className="flex items-center justify-between p-[12px_18px] bg-[#F8FAFC] rounded-xl border border-border mb-1">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={filtered.length > 0 && selectedIds.length === filtered.length}
                onChange={handleSelectAll}
                className="size-[18px] cursor-pointer accent-blue-500"
              />
              <span className="text-sm text-[#475569] font-bold">
                Chọn tất cả ({filtered.length} hồ sơ)
              </span>
            </div>
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-[14px] py-[6px] rounded-lg border-none bg-red-500 text-white cursor-pointer text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-500/20 transition-all duration-200 hover:bg-red-600"
              >
                <Trash2 size={14} /> Xóa đã chọn ({selectedIds.length})
              </button>
            )}
          </div>

          {filtered.map(app => (
            <ApplicantCard
              key={app.id}
              app={app}
              isSelected={selectedIds.includes(app.id)}
              onSelect={() => handleSelectOne(app.id)}
              onDelete={() => handleDeleteOne(app.id, app.seeker?.full_name || app.candidate_name)}
              onStatusChange={handleStatusChange}
              onScore={() => {
                setScoringTargetApplicant(app)
                setShowScoringModal(true)
              }}
            />
          ))}
        </div>
      )}

      {/* Scoring Modal */}
      <ScoringModal
        show={showScoringModal}
        onClose={() => {
          setShowScoringModal(false)
          setScoringResult(null)
          setScoringFile(null)
        }}
        onScore={handleScoreCv}
        scoringFile={scoringFile}
        setScoringFile={setScoringFile}
        scoringLoading={scoringLoading}
        scoringResult={scoringResult}
        scoringError={scoringError}
        scoringTargetApplicant={scoringTargetApplicant}
        jobTitle={jobTitle}
      />
    </div>
  )
}
