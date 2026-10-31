import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FileText, Wrench, Save, Loader2, CheckCircle2, Rocket, XCircle, Plus, AlertCircle, Building, Calendar, MapPin } from 'lucide-react'
import { employerService } from '../../services/employerService'
import { useAuth } from '../../context/AuthContext'
import Skeleton, { SkeletonCard } from '@/components/common/Skeleton'

const SKILL_SUGGESTIONS = [
  'React', 'Vue', 'Angular', 'Next.js', 'TypeScript', 'JavaScript',
  'Node.js', 'Express', 'NestJS', 'Python', 'FastAPI', 'Django',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes',
  'AWS', 'GCP', 'Figma', 'Photoshop', 'SQL', 'Git', 'CI/CD',
]

function Field({ label, required, hint, error, className = "", children }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-xs font-bold text-slate-800">
        {label} {required && <span className="text-rose-500">*</span>}
        {hint && <span className="text-[11px] text-slate-400 font-normal ml-1">({hint})</span>}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  )
}

const inputStyle = "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-inherit text-slate-900 box-border outline-none transition-all bg-white focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"

export default function EmployerJobFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { user } = useAuth()

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    companyName: user?.companyName || '',
    category: 'Công nghệ thông tin',
    job_type: 'full-time',
    level: 'junior',
    salary_min: '',
    salary_max: '',
    required_skills: [],
    requirements: '',
    benefits: '',
    status: 'draft',
    expired_at: '',
  })
  const [skillInput, setSkillInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!isEdit) return
    employerService.getJob(id).then(job => {
      setForm({
        title: job.title || '',
        description: job.description || '',
        location: job.location || '',
        companyName: job.companyName || user?.companyName || '',
        category: job.category || 'Công nghệ thông tin',
        job_type: job.job_type || 'full-time',
        level: job.level || 'junior',
        salary_min: job.salary_min || '',
        salary_max: job.salary_max || '',
        required_skills: job.required_skills || [],
        requirements: job.requirements || '',
        benefits: job.benefits || '',
        status: job.status || 'draft',
        expired_at: job.expired_at ? job.expired_at.slice(0, 10) : '',
      })
      setLoading(false)
    })
  }, [id])

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  const addSkill = (skill) => {
    const trimmed = skill.trim()
    if (trimmed && !form.required_skills.includes(trimmed)) {
      set('required_skills', [...form.required_skills, trimmed])
    }
    setSkillInput('')
  }

  const removeSkill = (skill) => set('required_skills', form.required_skills.filter(s => s !== skill))

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Vui lòng nhập tiêu đề'
    else if (form.title.trim().length < 3) e.title = 'Tiêu đề phải có ít nhất 3 ký tự'
    if (!form.description.trim()) e.description = 'Vui lòng nhập mô tả công việc'
    else if (form.description.trim().length < 10) e.description = 'Mô tả phải có ít nhất 10 ký tự'
    if (!form.location.trim()) e.location = 'Vui lòng nhập địa điểm'
    else if (form.location.trim().length < 3) e.location = 'Địa điểm phải có ít nhất 3 ký tự'
    if (!form.companyName.trim()) e.companyName = 'Vui lòng nhập tên công ty'
    if (form.salary_min && Number(form.salary_min) < 0)
      e.salary_min = 'Lương tối thiểu không được âm'
    if (form.salary_max && Number(form.salary_max) < 0)
      e.salary_max = 'Lương tối đa không được âm'
    if (form.salary_min && form.salary_max && Number(form.salary_min) > Number(form.salary_max))
      e.salary_min = 'Lương tối thiểu không được lớn hơn tối đa'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const [errorMsg, setErrorMsg] = useState('')

  const handleSave = async (publish = false) => {
    if (!validate()) return
    setSaving(true)
    setErrorMsg('')
    try {
      const payload = {
        ...form,
        salary_min: form.salary_min ? Number(form.salary_min) : null,
        salary_max: form.salary_max ? Number(form.salary_max) : null,
        expired_at: form.expired_at ? new Date(form.expired_at).toISOString() : null,
        status: publish ? 'pending' : form.status,
        companyName: form.companyName || user?.companyName || '',
      }
      if (isEdit) {
        await employerService.updateJob(id, payload)
      } else {
        await employerService.createJob(payload)
      }
      navigate('/employer/jobs')
    } catch (err) {
      const msg = err?.message || err?.data?.message || 'Có lỗi xảy ra khi lưu tin tuyển dụng. Vui lòng thử lại.'
      setErrorMsg(msg)
      console.error('Save job error:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-12 gap-6">
      <div className="lg:col-span-5 space-y-6">
        <SkeletonCard lines={6} />
        <SkeletonCard lines={3} />
      </div>
      <div className="lg:col-span-7 space-y-6">
        <SkeletonCard lines={8} />
      </div>
    </div>
  )

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto font-sans">
      {errorMsg && (
        <div className="px-4 py-3 rounded-2xl mb-6 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <XCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Column 1 (Left, 5 cols): Position Settings & Skills */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Card: Position Settings */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center shrink-0">
                <Building className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Thiết lập vị trí</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Field label="Tên công ty" required error={errors.companyName}>
                <input
                  value={form.companyName}
                  onChange={e => set('companyName', e.target.value)}
                  placeholder="VD: NexCV Corp"
                  className={`${inputStyle} ${errors.companyName ? '!border-rose-500' : ''}`}
                />
              </Field>

              <Field label="Ngành nghề" required>
                <select value={form.category} onChange={e => set('category', e.target.value)} className={inputStyle}>
                  <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                  <option value="Dữ liệu & AI">Dữ liệu & AI</option>
                  <option value="Thiết kế">Thiết kế</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Kinh doanh / Sales">Kinh doanh / Sales</option>
                  <option value="Tài chính - Kế toán">Tài chính - Kế toán</option>
                  <option value="Nhân sự">Nhân sự</option>
                  <option value="Khác">Khác</option>
                </select>
              </Field>

              <Field label="Hình thức" required>
                <select value={form.job_type} onChange={e => set('job_type', e.target.value)} className={inputStyle}>
                  <option value="full-time">Toàn thời gian</option>
                  <option value="part-time">Bán thời gian</option>
                  <option value="remote">Remote</option>
                  <option value="internship">Thực tập</option>
                </select>
              </Field>

              <Field label="Cấp độ" required>
                <select value={form.level} onChange={e => set('level', e.target.value)} className={inputStyle}>
                  <option value="intern">Intern</option>
                  <option value="fresher">Fresher</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid-level</option>
                  <option value="senior">Senior</option>
                </select>
              </Field>
            </div>

            <Field label="Địa điểm làm việc" required error={errors.location}>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={form.location}
                  onChange={e => set('location', e.target.value)}
                  placeholder="VD: TP. Hồ Chí Minh, Hà Nội, Remote..."
                  className={`${inputStyle} pl-9 ${errors.location ? '!border-rose-500' : ''}`}
                />
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3.5">
              <Field label="Lương từ" hint="VNĐ">
                <input
                  type="number"
                  min="0"
                  value={form.salary_min}
                  onChange={e => set('salary_min', e.target.value)}
                  placeholder="Tối thiểu"
                  className={inputStyle}
                />
              </Field>
              <Field label="Lương đến" hint="VNĐ">
                <input
                  type="number"
                  min="0"
                  value={form.salary_max}
                  onChange={e => set('salary_max', e.target.value)}
                  placeholder="Tối đa"
                  className={inputStyle}
                />
              </Field>
            </div>

            <Field label="Hạn nộp hồ sơ">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={form.expired_at}
                  onChange={e => set('expired_at', e.target.value)}
                  className={`${inputStyle} pl-9`}
                />
              </div>
            </Field>
          </div>

          {/* Card: Skills */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center shrink-0">
                  <Wrench className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Kỹ năng yêu cầu</h2>
              </div>

              {/* Selected Skills List */}
              <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                {form.required_skills.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-purple-50 text-[#7C3AED]"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-purple-900 text-sm leading-none cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {form.required_skills.length === 0 && (
                  <span className="text-xs text-slate-400 italic">Chưa chọn kỹ năng nào</span>
                )}
              </div>

              {/* Skill Input */}
              <div className="flex gap-2">
                <input
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSkill(skillInput)
                    }
                  }}
                  placeholder="Nhập kỹ năng rồi bấm Enter..."
                  className={`${inputStyle} flex-1`}
                />
                <button
                  type="button"
                  onClick={() => addSkill(skillInput)}
                  disabled={!skillInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Thêm
                </button>
              </div>
            </div>

            {/* Skill Suggestions */}
            <div className="pt-2">
              <p className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">Gợi ý nhanh:</p>
              <div className="flex flex-wrap gap-1.5">
                {SKILL_SUGGESTIONS.filter(s => !form.required_skills.includes(s)).slice(0, 10).map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => addSkill(skill)}
                    className="px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-[#7C3AED] transition-colors cursor-pointer"
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Column 2 (Right, 7 cols): Actions on Top + Job Content */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          
          {/* Action Buttons at the Top of Right Column */}
          <div className="flex gap-2.5 flex-col sm:flex-row justify-end shrink-0">
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="h-10 px-5 rounded-xl bg-purple-50 hover:bg-purple-100/80 text-[#7C3AED] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> Lưu nháp
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving}
              className="h-10 px-6 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Đang xử lý...
                </>
              ) : isEdit ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Cập nhật tin tuyển dụng
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" /> Đăng tin tuyển dụng
                </>
              )}
            </button>
          </div>

          {/* Card: Job Content */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 flex-1 flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Nội dung tuyển dụng</h2>
            </div>

            <Field label="Tiêu đề vị trí" required error={errors.title} className="shrink-0">
              <input
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="VD: Senior Frontend Developer (React)"
                className={`${inputStyle} ${errors.title ? '!border-rose-500' : ''}`}
              />
            </Field>

            <Field label="Mô tả công việc" required hint="nhiệm vụ, vai trò" error={errors.description} className="flex-1 flex flex-col">
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                rows={5}
                placeholder="Mô tả chi tiết công việc, trách nhiệm chính..."
                className={`${inputStyle} resize-y flex-1 min-h-[120px] ${errors.description ? '!border-rose-500' : ''}`}
              />
            </Field>

            <Field label="Yêu cầu ứng viên" hint="kinh nghiệm, kỹ năng" className="flex-1 flex flex-col">
              <textarea
                value={form.requirements}
                onChange={e => set('requirements', e.target.value)}
                rows={4}
                placeholder="Yêu cầu về kinh nghiệm, bằng cấp, kỹ năng mềm..."
                className={`${inputStyle} resize-y flex-1 min-h-[100px]`}
              />
            </Field>

            <Field label="Quyền lợi & Đãi ngộ" hint="chế độ, bảo hiểm" className="flex-1 flex flex-col">
              <textarea
                value={form.benefits}
                onChange={e => set('benefits', e.target.value)}
                rows={4}
                placeholder="Lương thưởng, bảo hiểm, môi trường làm việc, teambuilding..."
                className={`${inputStyle} resize-y flex-1 min-h-[90px]`}
              />
            </Field>
          </div>

        </div>

      </div>
    </div>
  )
}
