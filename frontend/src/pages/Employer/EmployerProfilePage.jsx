import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'
import { Building, Mail, Phone, Globe, Briefcase, Camera, CheckCircle2, Loader2, Save, AlertCircle, FileText } from 'lucide-react'

function Field({ label, required, children, icon: Icon, error }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
        {Icon && <Icon size={14} className="text-slate-400" />}
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <div className="flex items-center gap-1 mt-1 text-xs text-red-500">
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

const inputStyle = "w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none transition-all bg-white focus:border-[#7C3AED]"

export default function EmployerProfilePage() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    companyName: '',
    email: '',
    phone: '',
    industry: '',
    companyWebsite: '',
    description: '',
    avatar: '',
  })
  const [logoPreview, setLogoPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [phoneTouched, setPhoneTouched] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [companyNameError, setCompanyNameError] = useState('')
  const [companyNameTouched, setCompanyNameTouched] = useState(false)
  const [websiteError, setWebsiteError] = useState('')
  const [websiteTouched, setWebsiteTouched] = useState(false)

  const validateEmail = (value) => {
    if (!value.trim()) {
      setEmailError('')
      return true
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value.trim())) {
      setEmailError('Email không hợp lệ (VD: contact@company.com)')
      return false
    }
    setEmailError('')
    return true
  }

  const validateCompanyName = (value) => {
    if (!value.trim()) {
      setCompanyNameError('Tên công ty không được để trống')
      return false
    }
    if (value.trim().length < 2) {
      setCompanyNameError('Tên công ty phải có ít nhất 2 ký tự')
      return false
    }
    setCompanyNameError('')
    return true
  }

  const validateWebsite = (value) => {
    if (!value.trim()) {
      setWebsiteError('')
      return true
    }
    const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i
    if (!urlRegex.test(value.trim())) {
      setWebsiteError('Website không đúng định dạng (VD: https://company.com)')
      return false
    }
    setWebsiteError('')
    return true
  }

  const validatePhone = (value) => {
    if (!value.trim()) {
      setPhoneError('')
      return true
    }
    const vnPhoneRegex = /^(0[3-9][0-9]{8,9}|\+84[3-9][0-9]{8,9})$/
    const cleaned = value.replace(/[\s.\-()]/g, '')
    if (!vnPhoneRegex.test(cleaned)) {
      setPhoneError('Số điện thoại không đúng định dạng')
      return false
    }
    setPhoneError('')
    return true
  }

  useEffect(() => {
    if (user) {
      setForm({
        companyName: user.companyName || '',
        email: user.email || '',
        phone: user.phone || '',
        industry: user.industry || '',
        companyWebsite: user.companyWebsite || '',
        description: user.description || '',
        avatar: user.avatar || '',
      })
      setLogoPreview(user.avatar || null)
    }
  }, [user])

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    setSuccess(false)
    if (field === 'phone') {
      setPhoneTouched(true)
      validatePhone(value)
    }
    if (field === 'email') {
      setEmailTouched(true)
      validateEmail(value)
    }
    if (field === 'companyName') {
      setCompanyNameTouched(true)
      validateCompanyName(value)
    }
    if (field === 'companyWebsite') {
      setWebsiteTouched(true)
      validateWebsite(value)
    }
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result
      setLogoPreview(base64String)
      setForm(f => ({ ...f, avatar: base64String }))
      setSuccess(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!form.companyName || !form.email) return alert("Vui lòng điền các trường bắt buộc")
    if (form.email.trim() && !validateEmail(form.email)) return alert('Vui lòng kiểm tra lại email')
    if (!validateCompanyName(form.companyName)) return alert('Vui lòng kiểm tra lại tên công ty')
    if (form.phone.trim() && !validatePhone(form.phone)) return alert('Vui lòng kiểm tra lại số điện thoại')
    if (form.companyWebsite.trim() && !validateWebsite(form.companyWebsite)) return alert('Vui lòng kiểm tra lại website')
    setSaving(true)
    try {
      const updatedUser = await authService.updateProfile({
        ...form,
        role: 'employer'
      })
      updateUser(updatedUser)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      alert("Lỗi cập nhật: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto font-sans">
      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Column 1 (Left): Brand Card & Logo */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 flex flex-col items-center text-center">
            {/* Logo Box */}
            <div
              onClick={() => document.getElementById('logo-upload').click()}
              className="w-28 h-28 rounded-3xl bg-[#F5F3FF] flex items-center justify-center text-[#7C3AED] text-3xl font-black relative cursor-pointer overflow-hidden border-2 border-dashed border-purple-200 group transition-all hover:border-[#7C3AED]"
              title="Nhấn để đổi logo"
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
              ) : (
                form.companyName ? form.companyName.slice(0, 2).toUpperCase() : 'HR'
              )}

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                <Camera size={18} />
                <span className="text-[10px] font-bold mt-1">Đổi logo</span>
              </div>

              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </div>

            <h3 className="text-base font-bold text-slate-900 mt-4 line-clamp-1">
              {form.companyName || 'Tên doanh nghiệp'}
            </h3>

            {form.industry && (
              <span className="mt-1.5 text-xs font-semibold px-3 py-1 rounded-xl bg-purple-50 text-[#7C3AED]">
                {form.industry}
              </span>
            )}

            <p className="text-xs text-slate-400 mt-3">
              Nhấp vào ảnh để tải logo mới (PNG, JPG dưới 2MB).
            </p>
          </div>
        </div>

        {/* Column 2 (Right): Detail Information Form */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center shrink-0">
                <Building className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Thông tin doanh nghiệp</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Tên công ty" required icon={Building} error={companyNameTouched ? companyNameError : ''}>
                <input
                  value={form.companyName}
                  onChange={e => handleChange('companyName', e.target.value)}
                  className={`${inputStyle} ${companyNameTouched && companyNameError ? '!border-red-500' : ''}`}
                  placeholder="VD: Công ty TNHH NexCV"
                />
              </Field>

              <Field label="Lĩnh vực hoạt động" icon={Briefcase}>
                <input
                  value={form.industry}
                  onChange={e => handleChange('industry', e.target.value)}
                  className={inputStyle}
                  placeholder="VD: Công nghệ thông tin, Tài chính..."
                />
              </Field>

              <Field label="Email liên hệ" required icon={Mail} error={emailTouched ? emailError : ''}>
                <input
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  className={`${inputStyle} ${emailTouched && emailError ? '!border-red-500' : ''}`}
                  type="email"
                  placeholder="contact@company.com"
                />
              </Field>

              <Field label="Số điện thoại" icon={Phone} error={phoneTouched ? phoneError : ''}>
                <input
                  value={form.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  className={`${inputStyle} ${phoneTouched && phoneError ? '!border-red-500' : ''}`}
                  placeholder="0901234567"
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Website công ty" icon={Globe} error={websiteTouched ? websiteError : ''}>
                  <input
                    value={form.companyWebsite}
                    onChange={e => handleChange('companyWebsite', e.target.value)}
                    className={`${inputStyle} ${websiteTouched && websiteError ? '!border-red-500' : ''}`}
                    placeholder="https://www.yourcompany.com"
                  />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field label="Mô tả công ty" icon={FileText}>
                  <textarea
                    value={form.description}
                    onChange={e => handleChange('description', e.target.value)}
                    rows={5}
                    className={`${inputStyle} resize-y min-h-[120px]`}
                    placeholder="Giới thiệu về công ty, văn hóa và môi trường làm việc..."
                  />
                </Field>
              </div>
            </div>

            {/* Actions (Zero separator) */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                {success && (
                  <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl flex items-center gap-1.5">
                    <CheckCircle2 size={16} /> Đã lưu thông tin thành công
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto h-11 px-7 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
