import { useState, useEffect } from 'react'
import { Download, FileEdit, Save, AlertCircle, X, Loader2, CheckCircle2 } from 'lucide-react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { DEFAULT_CV } from './components/constants'
import { CVPreview } from './components/CVPreview'
import { CVPDFDocument } from './components/CVPDFDocument'
import { EditorPanel } from './components/EditorPanel'
import { authService } from '@/services/authService'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

// Các trường bắt buộc và tên hiển thị
const REQUIRED_FIELDS = [
  { path: 'personal.name',     label: 'Họ và tên' },
  { path: 'personal.phone',    label: 'Số điện thoại' },
  { path: 'personal.email',    label: 'Email' },
  { path: 'personal.location', label: 'Địa chỉ / Thành phố' },
  { path: 'personal.title',    label: 'Chức danh / Vị trí ứng tuyển' },
  { path: 'personal.summary',  label: 'Giới thiệu bản thân' },
]

const VIEWS = [
  { key: 'edit',    label: 'Sửa' },
  { key: 'split',   label: 'Chia đôi' },
  { key: 'preview', label: 'Xem trước' },
]

function getField(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

function validateCV(cv) {
  const errors = []
  for (const field of REQUIRED_FIELDS) {
    const value = getField(cv, field.path)
    if (!value || String(value).trim() === '') {
      errors.push(field.label)
    }
  }
  // Phải có ít nhất 1 kinh nghiệm hoặc 1 học vấn
  const hasExp = cv.experience?.length > 0 && cv.experience.some(e => e.company?.trim())
  const hasEdu = cv.education?.length > 0 && cv.education.some(e => e.school?.trim())
  if (!hasExp && !hasEdu) {
    errors.push('Kinh nghiệm hoặc học vấn')
  }
  // Phải có kỹ năng
  if (!cv.skills?.length || !cv.skills.some(s => s.items?.trim())) {
    errors.push('Kỹ năng')
  }
  return errors
}

export default function CVBuilderPage() {
  const [cv, setCv] = useState(DEFAULT_CV)
  const [view, setView] = useState('split')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const { isAuthenticated } = useAuth()

  const STORAGE_KEY = 'nexcv_cv_builder_draft'

  // Load saved CV on mount
  useEffect(() => {
    const loadSavedCV = async () => {
      if (isAuthenticated) {
        // Load from server for authenticated users
        try {
          const profile = await authService.getProfile(localStorage.getItem('nexcv_candidate_token') || localStorage.getItem('nexcv_token'))
          const user = profile?.data || profile
          if (user?.cvBuilderData) {
            setCv(user.cvBuilderData)
            return
          }
        } catch (err) {
          console.debug('[CVBuilderPage.loadSavedCV] Không load được từ server, dùng localStorage:', err)
        }
      }
      // Fallback: load from localStorage (guest or server empty)
      try {
        const draft = localStorage.getItem(STORAGE_KEY)
        if (draft) setCv(JSON.parse(draft))
      } catch (err) {
        console.debug('[CVBuilderPage.loadSavedCV] Lỗi parse localStorage draft:', err)
      }
    }
    loadSavedCV()
  }, [isAuthenticated])

  // Derived — re-computed on every render, always up to date
  const currentErrors = validateCV(cv)
  const isValid = currentErrors.length === 0

  const handleSave = async () => {
    setSaving(true)
    try {
      // Always save to localStorage as a fast local backup
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cv))
      // If logged in, also persist to server profile
      if (isAuthenticated) {
        await authService.updateProfile({ cvBuilderData: cv })
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error('[CVBuilderPage.handleSave] Lỗi lưu CV:', err)
      /* localStorage đã lưu ở trên, tiếp tục hiển thị thông báo đã lưu */
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  const handleExportClick = () => {
    if (!isValid) {
      setShowErrors(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    // If valid, PDFDownloadLink renders and handles the click itself
  }

  const handleCvChange = (newCv) => {
    setCv(newCv)
    // Auto-hide error banner once all fields are filled
    if (showErrors && validateCV(newCv).length === 0) {
      setShowErrors(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Toolbar */}
      <div className="bg-white/95 backdrop-blur shadow-sm sticky top-16 z-20">
        <div className="container-app h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-xl bg-[#EEF2FF] text-[#1549B8] flex items-center justify-center shrink-0">
              <FileEdit className="h-4 w-4" />
            </span>
            <span className="font-bold text-sm text-[#0F172A] truncate">Tạo CV</span>
          </div>

          {/* View toggle — desktop */}
          <div className="hidden md:flex items-center gap-1 bg-[#F1F5F9] rounded-xl p-1">
            {VIEWS.map(v => (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                className={cn(
                  'px-3 h-7 rounded-lg text-xs font-semibold transition-colors',
                  view === v.key
                    ? 'bg-white text-[#0F172A] shadow-sm'
                    : 'text-slate-500 hover:text-[#0F172A]'
                )}
              >
                {v.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                'inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50',
                saved
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-[#F1F5F9] text-slate-700 hover:bg-slate-200'
              )}
            >
              {saving
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Đang lưu</>
                : saved
                  ? <><CheckCircle2 className="h-3.5 w-3.5" />Đã lưu</>
                  : <><Save className="h-3.5 w-3.5" />Lưu</>}
            </button>

            {/* Export button — always re-checks current cv state */}
            {isValid ? (
              <PDFDownloadLink
                document={<CVPDFDocument cv={cv} />}
                fileName={`CV_${cv.personal?.name || 'CV'}.pdf`}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-semibold bg-[#1549B8] hover:bg-[#1240A0] text-white no-underline transition-colors"
              >
                {({ loading }) => (
                  <>
                    <Download className="h-3.5 w-3.5" />
                    {loading ? 'Đang tạo' : 'Xuất PDF'}
                  </>
                )}
              </PDFDownloadLink>
            ) : (
              <button
                onClick={handleExportClick}
                className={cn(
                  'inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-semibold transition-colors',
                  showErrors
                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                    : 'bg-[#1549B8] hover:bg-[#1240A0] text-white'
                )}
              >
                {showErrors
                  ? <><AlertCircle className="h-3.5 w-3.5" />Thiếu {currentErrors.length}</>
                  : <><Download className="h-3.5 w-3.5" />Xuất PDF</>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-app py-5">
        {/* Validation card */}
        {showErrors && currentErrors.length > 0 && (
          <div className="bg-rose-50 rounded-2xl p-4 mb-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-rose-700 text-sm">
                Còn thiếu {currentErrors.length} mục
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {currentErrors.map((err, i) => (
                  <span key={i} className="text-xs text-rose-600 bg-white rounded-lg px-2 py-1">
                    {err}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowErrors(false)}
              className="shrink-0 w-8 h-8 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-white flex items-center justify-center transition-colors"
              aria-label="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* View toggle — mobile */}
        <div className="flex md:hidden items-center gap-1 bg-white rounded-xl p-1 mb-4 shadow-sm">
          {VIEWS.map(v => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={cn(
                'flex-1 h-8 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap',
                view === v.key
                  ? 'bg-[#1549B8] text-white'
                  : 'text-slate-500 hover:text-[#0F172A]'
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Split view (default) */}
        {view === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_480px] gap-5 items-start">
            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-12rem)] lg:max-h-[calc(100vh-10rem)] pr-1">
              <EditorPanel cv={cv} onChange={handleCvChange} />
            </div>
            <div className="hidden lg:block lg:sticky lg:top-30 overflow-auto max-h-none lg:max-h-[calc(100vh-10rem)] rounded-2xl shadow-xl">
              <CVPreview cv={cv} />
            </div>
          </div>
        )}

        {view === 'edit' && (
          <div className="max-w-2xl mx-auto">
            <EditorPanel cv={cv} onChange={handleCvChange} />
          </div>
        )}

        {view === 'preview' && (
          <div className="max-w-full lg:max-w-195 mx-auto shadow-xl rounded-2xl overflow-hidden">
            <CVPreview cv={cv} />
          </div>
        )}
      </div>
    </div>
  )
}
