import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import { 
  Globe, Shield, Cpu, Briefcase, Users, 
  Save, RefreshCw, CheckCircle2, AlertCircle,
  Mail, Phone, Lock, FileCode, ChevronRight,
  Settings, Bell, Database, Key
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import Spinner from '@/components/common/Spinner'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null)
  const [activeTab, setActiveTab] = useState('site')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fetchError, setFetchError] = useState(false)
  const [settingsErrors, setSettingsErrors] = useState({})

  const validateSettings = () => {
    const errors = {}
    const site = settings?.site
    if (site?.siteUrl && !/^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(site.siteUrl)) {
      errors['site.siteUrl'] = 'URL không hợp lệ'
    }
    if (site?.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.contactEmail)) {
      errors['site.contactEmail'] = 'Email không hợp lệ'
    }
    if (site?.contactPhone && !/^(0[3-9][0-9]{8,9}|\+84[3-9][0-9]{8,9}|\d{10,11})$/.test(site.contactPhone.replace(/[\s.\-()]/g, ''))) {
      errors['site.contactPhone'] = 'Số điện thoại không hợp lệ'
    }
    if (settings?.ai) {
      if (settings.ai.maxFileSizeMB < 1 || settings.ai.maxFileSizeMB > 50) errors['ai.maxFileSizeMB'] = 'Từ 1-50 MB'
      if (settings.ai.dailyScoreLimit < 1 || settings.ai.dailyScoreLimit > 100) errors['ai.dailyScoreLimit'] = 'Từ 1-100'
    }
    if (settings?.jobs) {
      if (settings.jobs.maxJobsPerEmployer < 1 || settings.jobs.maxJobsPerEmployer > 100) errors['jobs.maxJobsPerEmployer'] = 'Từ 1-100'
      if (settings.jobs.jobExpiryDays < 1 || settings.jobs.jobExpiryDays > 365) errors['jobs.jobExpiryDays'] = 'Từ 1-365 ngày'
    }
    if (settings?.users) {
      if (settings.users.maxSavedJobs < 1 || settings.users.maxSavedJobs > 200) errors['users.maxSavedJobs'] = 'Từ 1-200'
    }
    if (settings?.security) {
      if (settings.security.passwordMinLength < 4 || settings.security.passwordMinLength > 128) errors['security.passwordMinLength'] = 'Từ 4-128 ký tự'
      if (settings.security.maxLoginAttempts < 1 || settings.security.maxLoginAttempts > 20) errors['security.maxLoginAttempts'] = 'Từ 1-20'
      if (settings.security.sessionTimeoutMin < 1 || settings.security.sessionTimeoutMin > 1440) errors['security.sessionTimeoutMin'] = 'Từ 1-1440 phút'
    }
    setSettingsErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Fetch settings from API on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      try {
        const res = await adminService.getSettings()
        setSettings(res?.data || res)
      } catch (err) {
        console.error('Failed to fetch settings:', err)
        setFetchError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    if (!validateSettings()) return
    setSaving(true)
    setSaved(false)
    try {
      // Save all sections in parallel
      const results = await Promise.allSettled(
        Object.entries(settings || {})
          .filter(([, data]) => typeof data === 'object' && data !== null)
          .map(([section, data]) => adminService.updateSettings(section, data))
      )

      const failed = results.filter(r => r.status === 'rejected')
      if (failed.length > 0) {
        console.error('Failed to save some settings:', failed.map(r => r.reason))
        return // Don't show success toast if any section failed
      }

      // Fetch lại từ DB thay vì dùng response của section đầu tiên
      const freshSettings = await adminService.getSettings()
      setSettings(freshSettings?.data || freshSettings)

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Failed to save settings:', err)
    } finally {
      setSaving(false)
    }
  }

  const hasError = (key) => !!settingsErrors[key]

  const updateSetting = (group, field, value) => {
    setSettings(prev => ({
      ...prev,
      [group]: {
        ...prev[group],
        [field]: value
      }
    }))
    // Clear error on change
    setSettingsErrors(prev => {
      const next = { ...prev }
      delete next[`${group}.${field}`]
      return next
    })
  }

  const Toggle = ({ checked, onChange, label, description, disabled }) => (
    <div className="flex items-center justify-between py-6 first:pt-0 last:pb-0">
      <div className="space-y-1">
        <Label className="text-[15px] font-black text-slate-900">{label}</Label>
        {description && <p className="text-xs text-slate-400 font-medium">{description}</p>}
      </div>
      <button 
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none",
          checked ? 'bg-[#1549B8] shadow-lg shadow-blue-200' : 'bg-slate-200',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        disabled={disabled}
      >
        <span className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-all shadow-sm",
          checked ? 'translate-x-6' : 'translate-x-1'
        )} />
      </button>
    </div>
  )

  const menuItems = [
    { id: 'site', label: 'Cấu hình chung', icon: Globe, desc: 'Tên trang web, liên hệ, bảo trì' },
    { id: 'ai', label: 'Trí tuệ nhân tạo', icon: Cpu, desc: 'Chấm điểm CV, giới hạn AI' },
    { id: 'jobs', label: 'Quy trình tuyển dụng', icon: Briefcase, desc: 'Duyệt tin, thời hạn, giới hạn' },
    { id: 'users', label: 'Quản lý người dùng', icon: Users, desc: 'Xác minh, bảo mật, lưu trữ' },
    { id: 'security', label: 'Bảo mật & Quyền', icon: Shield, desc: 'Mật khẩu, quyền truy cập' },
  ]

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto min-h-screen">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 md:mb-10">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter">Thiết lập hệ thống</h1>
          <p className="text-slate-400 font-medium mt-2 text-sm">Tùy chỉnh các tham số vận hành và quy tắc bảo mật của NexCV</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
           {saved && (
             <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-right-4">
                <CheckCircle2 size={16} /> Đã lưu thành công
             </div>
           )}
           <Button 
            onClick={handleSave} 
            disabled={saving || !settings}
            className="rounded-2xl h-12 px-8 font-black bg-[#1549B8] hover:bg-[#1e40af] shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        {/* Left Sidebar Navigation */}
        <div className="w-full lg:w-[320px] flex-shrink-0 space-y-1">
          {/* Mobile: horizontal scrollable tabs */}
          <div className="flex lg:hidden overflow-x-auto gap-2 pb-2 -mx-2 px-2 snap-x snap-mandatory">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex-shrink-0 snap-center flex items-center gap-3 px-4 py-3 rounded-[20px] transition-all text-left",
                  activeTab === item.id 
                    ? "bg-white shadow-lg shadow-slate-100 border border-slate-100" 
                    : "bg-slate-50 border border-transparent"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  activeTab === item.id ? "bg-[#1549B8] text-white" : "bg-white text-slate-400"
                )}>
                  <item.icon size={18} />
                </div>
                <div className="overflow-hidden">
                  <div className={cn("font-black text-xs", activeTab === item.id ? "text-slate-900" : "text-slate-500")}>
                    {item.label}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {/* Desktop: stacked layout */}
          <div className="hidden lg:block space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-[24px] transition-all text-left group",
                  activeTab === item.id 
                    ? "bg-white shadow-xl shadow-slate-100 border border-slate-100" 
                    : "hover:bg-slate-50 border border-transparent"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                  activeTab === item.id ? "bg-[#1549B8] text-white rotate-3" : "bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-slate-600"
                )}>
                  <item.icon size={22} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className={cn("font-black text-sm", activeTab === item.id ? "text-slate-900" : "text-slate-500")}>
                    {item.label}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium truncate">{item.desc}</div>
                </div>
                {activeTab === item.id && <ChevronRight size={16} className="text-[#1549B8]" />}
              </button>
            ))}
          </div>
          
          <div className="hidden lg:block mt-10 p-6 bg-slate-900 rounded-[32px] text-white">
             <div className="flex items-center gap-2 text-violet-400 text-[10px] font-black uppercase tracking-widest mb-2">
                <Settings size={12} /> System Status
             </div>
             <h4 className="text-sm font-bold mb-3">Phiên bản v1.2.0</h4>
             <p className="text-[11px] text-slate-400 leading-relaxed mb-4">Mọi thay đổi sẽ được ghi lại trong nhật ký quản trị.</p>
             <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Dịch vụ đang ổn định
             </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 animate-in fade-in duration-500 min-w-0">
          <div className="bg-white rounded-[24px] lg:rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-100/50 p-5 md:p-8 lg:p-10 min-h-[400px] lg:min-h-[600px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full py-20">
                <Spinner size="xl" color="blue" text="Đang tải cấu hình..." />
              </div>
            ) : fetchError ? (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                <AlertCircle size={48} className="text-red-400 mb-4" />
                <h3 className="text-lg font-black text-slate-900 mb-2">Không thể tải cấu hình</h3>
                <p className="text-slate-400 text-sm max-w-xs mb-6">Có lỗi xảy ra khi kết nối đến máy chủ. Vui lòng thử lại sau.</p>
                <Button onClick={() => window.location.reload()} variant="outline" className="rounded-2xl h-11">Tải lại trang</Button>
              </div>
            ) : !settings ? null : (
            <>
            {activeTab === 'site' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Thông tin chung</h3>
                  <p className="text-sm text-slate-400 font-medium">Quản lý nhận diện thương hiệu và thông tin liên hệ chính thức</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700 ml-1">Tên nền tảng</Label>
                    <Input value={settings.site.siteName} onChange={e => updateSetting('site', 'siteName', e.target.value)} className="rounded-2xl h-12 bg-slate-50 border-none px-5 focus:ring-2 focus:ring-blue-500/10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700 ml-1">URL chính thức</Label>
                    <Input value={settings.site.siteUrl} onChange={e => updateSetting('site', 'siteUrl', e.target.value)}
                      className={`rounded-2xl h-12 bg-slate-50 border-none px-5 focus:ring-2 focus:ring-blue-500/10 ${hasError('site.siteUrl') ? 'ring-2 ring-red-300 bg-red-50' : ''}`} />
                    {settingsErrors['site.siteUrl'] && (
                      <p className="flex items-center gap-1 text-[11px] font-semibold text-red-500 mt-1 ml-1">
                        <AlertCircle size={11} /> {settingsErrors['site.siteUrl']}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700 ml-1">Email quản trị</Label>
                    <Input value={settings.site.contactEmail} onChange={e => updateSetting('site', 'contactEmail', e.target.value)}
                      className={`rounded-2xl h-12 bg-slate-50 border-none px-5 focus:ring-2 focus:ring-blue-500/10 ${hasError('site.contactEmail') ? 'ring-2 ring-red-300 bg-red-50' : ''}`} />
                    {settingsErrors['site.contactEmail'] && (
                      <p className="flex items-center gap-1 text-[11px] font-semibold text-red-500 mt-1 ml-1">
                        <AlertCircle size={11} /> {settingsErrors['site.contactEmail']}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700 ml-1">Hotline hỗ trợ</Label>
                    <Input value={settings.site.contactPhone} onChange={e => updateSetting('site', 'contactPhone', e.target.value)}
                      className={`rounded-2xl h-12 bg-slate-50 border-none px-5 focus:ring-2 focus:ring-blue-500/10 ${hasError('site.contactPhone') ? 'ring-2 ring-red-300 bg-red-50' : ''}`} />
                    {settingsErrors['site.contactPhone'] && (
                      <p className="flex items-center gap-1 text-[11px] font-semibold text-red-500 mt-1 ml-1">
                        <AlertCircle size={11} /> {settingsErrors['site.contactPhone']}
                      </p>
                    )}
                  </div>
                </div>
                <Separator className="bg-slate-50" />
                <Toggle 
                  label="Chế độ bảo trì (Maintenance Mode)" 
                  description="Khi bật, người dùng sẽ không thể truy cập vào trang web và ứng dụng."
                  checked={settings.site.maintenanceMode} 
                  onChange={val => updateSetting('site', 'maintenanceMode', val)} 
                />
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Trí tuệ nhân tạo (AI)</h3>
                  <p className="text-sm text-slate-400 font-medium">Cấu hình các tham số cho công cụ phân tích và chấm điểm CV</p>
                </div>
                <Toggle 
                  label="Kích hoạt chấm điểm CV" 
                  description="Cho phép Nhà tuyển dụng sử dụng AI để đánh giá độ phù hợp của CV với công việc."
                  checked={settings.ai.cvScoreEnabled} 
                  onChange={val => updateSetting('ai', 'cvScoreEnabled', val)} 
                />
                <Separator className="bg-slate-50" />
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700 ml-1">Dung lượng file tối đa (MB)</Label>
                    <Input type="number" value={settings.ai.maxFileSizeMB} onChange={e => updateSetting('ai', 'maxFileSizeMB', parseInt(e.target.value, 10) || 1)}
                      className={`rounded-2xl h-12 bg-slate-50 border-none px-5 ${hasError('ai.maxFileSizeMB') ? 'ring-2 ring-red-300 bg-red-50' : ''}`} />
                    {settingsErrors['ai.maxFileSizeMB'] && (
                      <p className="flex items-center gap-1 text-[11px] font-semibold text-red-500 mt-1 ml-1">
                        <AlertCircle size={11} /> {settingsErrors['ai.maxFileSizeMB']}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700 ml-1">Giới hạn chấm điểm / ngày</Label>
                    <Input type="number" value={settings.ai.dailyScoreLimit} onChange={e => updateSetting('ai', 'dailyScoreLimit', parseInt(e.target.value, 10) || 1)}
                      className={`rounded-2xl h-12 bg-slate-50 border-none px-5 ${hasError('ai.dailyScoreLimit') ? 'ring-2 ring-red-300 bg-red-50' : ''}`} />
                    {settingsErrors['ai.dailyScoreLimit'] && (
                      <p className="flex items-center gap-1 text-[11px] font-semibold text-red-500 mt-1 ml-1">
                        <AlertCircle size={11} /> {settingsErrors['ai.dailyScoreLimit']}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'jobs' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Quy trình tuyển dụng</h3>
                  <p className="text-sm text-slate-400 font-medium">Quản lý cách thức vận hành của các tin đăng và phê duyệt</p>
                </div>
                <Toggle 
                  label="Phê duyệt tin đăng bắt buộc" 
                  description="Admin phải kiểm duyệt nội dung trước khi tin đăng được hiển thị công khai."
                  checked={settings.jobs.requireApproval} 
                  onChange={val => updateSetting('jobs', 'requireApproval', val)} 
                />
                <Separator className="bg-slate-50" />
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700 ml-1">Số tin tối đa / Nhà tuyển dụng</Label>
                    <Input type="number" value={settings.jobs.maxJobsPerEmployer} onChange={e => updateSetting('jobs', 'maxJobsPerEmployer', parseInt(e.target.value, 10) || 1)}
                      className={`rounded-2xl h-12 bg-slate-50 border-none px-5 ${hasError('jobs.maxJobsPerEmployer') ? 'ring-2 ring-red-300 bg-red-50' : ''}`} />
                    {settingsErrors['jobs.maxJobsPerEmployer'] && (
                      <p className="flex items-center gap-1 text-[11px] font-semibold text-red-500 mt-1 ml-1">
                        <AlertCircle size={11} /> {settingsErrors['jobs.maxJobsPerEmployer']}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700 ml-1">Thời gian hiển thị tin (Ngày)</Label>
                    <Input type="number" value={settings.jobs.jobExpiryDays} onChange={e => updateSetting('jobs', 'jobExpiryDays', parseInt(e.target.value, 10) || 1)}
                      className={`rounded-2xl h-12 bg-slate-50 border-none px-5 ${hasError('jobs.jobExpiryDays') ? 'ring-2 ring-red-300 bg-red-50' : ''}`} />
                    {settingsErrors['jobs.jobExpiryDays'] && (
                      <p className="flex items-center gap-1 text-[11px] font-semibold text-red-500 mt-1 ml-1">
                        <AlertCircle size={11} /> {settingsErrors['jobs.jobExpiryDays']}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Quản lý người dùng</h3>
                  <p className="text-sm text-slate-400 font-medium">Cấu hình các lớp bảo mật và giới hạn cho ứng viên/NTD</p>
                </div>
                <Toggle 
                  label="Xác minh pháp nhân Nhà tuyển dụng" 
                  description="Yêu cầu NTD tải lên giấy phép kinh doanh trước khi được phép đăng tin."
                  checked={settings.users.employerVerificationRequired} 
                  onChange={val => updateSetting('users', 'employerVerificationRequired', val)} 
                />
                <Separator className="bg-slate-50" />
                <Toggle 
                  label="Bắt buộc xác thực email" 
                  description="Gửi mã xác thực qua email khi người dùng đăng ký tài khoản mới."
                  checked={settings.users.emailVerificationRequired} 
                  onChange={val => updateSetting('users', 'emailVerificationRequired', val)} 
                />
                <Separator className="bg-slate-50" />
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700 ml-1">Số CV đã lưu tối đa / Ứng viên</Label>
                    <Input type="number" value={settings.users.maxSavedJobs} onChange={e => updateSetting('users', 'maxSavedJobs', parseInt(e.target.value, 10) || 1)}
                      className={`rounded-2xl h-12 bg-slate-50 border-none px-5 ${hasError('users.maxSavedJobs') ? 'ring-2 ring-red-300 bg-red-50' : ''}`} />
                    {settingsErrors['users.maxSavedJobs'] && (
                      <p className="flex items-center gap-1 text-[11px] font-semibold text-red-500 mt-1 ml-1">
                        <AlertCircle size={11} /> {settingsErrors['users.maxSavedJobs']}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Bảo mật & Quyền hạn</h3>
                  <p className="text-sm text-slate-400 font-medium">Cấu hình các tham số bảo mật và kiểm soát truy cập hệ thống</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700 ml-1">Độ dài mật khẩu tối thiểu</Label>
                    <Input type="number" value={settings.security?.passwordMinLength ?? 6} onChange={e => updateSetting('security', 'passwordMinLength', parseInt(e.target.value, 10) || 1)}
                      className={`rounded-2xl h-12 bg-slate-50 border-none px-5 ${hasError('security.passwordMinLength') ? 'ring-2 ring-red-300 bg-red-50' : ''}`} />
                    {settingsErrors['security.passwordMinLength'] && (
                      <p className="flex items-center gap-1 text-[11px] font-semibold text-red-500 mt-1 ml-1">
                        <AlertCircle size={11} /> {settingsErrors['security.passwordMinLength']}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700 ml-1">Số lần đăng nhập sai tối đa</Label>
                    <Input type="number" value={settings.security?.maxLoginAttempts ?? 5} onChange={e => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value, 10) || 1)}
                      className={`rounded-2xl h-12 bg-slate-50 border-none px-5 ${hasError('security.maxLoginAttempts') ? 'ring-2 ring-red-300 bg-red-50' : ''}`} />
                    {settingsErrors['security.maxLoginAttempts'] && (
                      <p className="flex items-center gap-1 text-[11px] font-semibold text-red-500 mt-1 ml-1">
                        <AlertCircle size={11} /> {settingsErrors['security.maxLoginAttempts']}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700 ml-1">Thời gian hết phiên (Phút)</Label>
                    <Input type="number" value={settings.security?.sessionTimeoutMin ?? 60} onChange={e => updateSetting('security', 'sessionTimeoutMin', parseInt(e.target.value, 10) || 1)}
                      className={`rounded-2xl h-12 bg-slate-50 border-none px-5 ${hasError('security.sessionTimeoutMin') ? 'ring-2 ring-red-300 bg-red-50' : ''}`} />
                    {settingsErrors['security.sessionTimeoutMin'] && (
                      <p className="flex items-center gap-1 text-[11px] font-semibold text-red-500 mt-1 ml-1">
                        <AlertCircle size={11} /> {settingsErrors['security.sessionTimeoutMin']}
                      </p>
                    )}
                  </div>
                </div>
                <Separator className="bg-slate-50" />
                <Toggle 
                  label="Nhật ký kiểm toán (Audit Log)"
                  description="Ghi lại tất cả hành động quản trị và thay đổi hệ thống."
                  checked={settings.security?.auditLogEnabled ?? true}
                  onChange={val => updateSetting('security', 'auditLogEnabled', val)}
                />
                <Toggle 
                  label="Xác thực đa yếu tố (MFA)"
                  description="Yêu cầu mã xác thực bổ sung khi đăng nhập (đang phát triển)."
                  checked={settings.security?.mfaEnabled ?? false}
                  onChange={val => updateSetting('security', 'mfaEnabled', val)}
                  disabled
                />
              </div>
            )}
            </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
