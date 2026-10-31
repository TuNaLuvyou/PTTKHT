import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, FileText, Bookmark, Send, FileEdit } from 'lucide-react'
import { ProfileTab } from './profile/ProfileTab'
import { CVTab }      from './profile/CVTab'
import { AppliedTab } from './profile/AppliedTab'
import { SavedTab }   from './profile/SavedTab'
import { cn } from '@/lib/utils'

const TABS = [
  { key: 'info',    label: 'Hồ sơ',          icon: User },
  { key: 'cvs',     label: 'CV của tôi',     icon: FileText },
  { key: 'applied', label: 'Đã ứng tuyển',   icon: Send },
  { key: 'saved',   label: 'Việc đã lưu',    icon: Bookmark },
]

const initials = name => {
  if (!name) return 'U'
  try { return name.trim().split(/\s+/).slice(-2).map(w => w[0]).join('').toUpperCase() || 'U' }
  // Defensive: tên bất thường (null, không phải chuỗi) → trả 'U', không ảnh hưởng UI
  catch { return 'U' }
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'info')

  // ── Đồng bộ tab khi URL thay đổi (Link từ UserDropdown) ──
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab')
    if (tabFromUrl) setActiveTab(tabFromUrl)
  }, [searchParams])

  const selectTab = (key) => {
    setActiveTab(key)
    setSearchParams({ tab: key }, { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* Hero */}
      <div className="bg-[#0F172A]">
        <div className="container-app py-8 md:py-10 flex flex-col sm:flex-row sm:items-center gap-5">
          <Avatar className="h-16 w-16 md:h-20 md:w-20 shrink-0">
            <AvatarFallback className="text-xl font-black bg-[#1549B8] text-white">
              {initials(user?.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-300 mb-1.5">
              Hồ sơ ứng viên
            </p>
            <h1 className="text-xl md:text-2xl font-black text-white leading-tight truncate">
              {user?.name}
            </h1>
            <p className="text-slate-400 text-sm mt-1 truncate">
              {user?.title || user?.email}
            </p>
          </div>

          {activeTab === 'info' && (
            <Link
              to="/cv-builder"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-white text-[#0F172A] text-sm font-bold hover:bg-[#EEF2FF] transition-colors shrink-0"
            >
              <FileEdit className="h-4 w-4 text-[#1549B8]" />
              Tạo CV
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container-app pt-5 md:pt-6 flex flex-col md:flex-row gap-4 md:gap-6 items-start">
        {/* Mobile tabs */}
        <div className="w-full md:hidden -mx-4 px-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-1">
            {TABS.map(tab => {
              const Icon = tab.icon
              const active = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => selectTab(tab.key)}
                  className={cn(
                    'inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-xs font-semibold transition-colors',
                    active
                      ? 'bg-[#1549B8] text-white'
                      : 'bg-white text-slate-600 hover:bg-[#EEF2FF] hover:text-[#1549B8]'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Desktop sidebar */}
        <aside className="hidden md:block w-52 shrink-0 sticky top-20">
          <nav className="flex flex-col gap-1 bg-white rounded-3xl p-2 shadow-sm">
            {TABS.map(tab => {
              const Icon = tab.icon
              const active = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => selectTab(tab.key)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2.5 px-3.5 h-10 rounded-xl text-sm transition-colors text-left w-full',
                    active
                      ? 'bg-[#1549B8] text-white font-semibold'
                      : 'text-slate-600 font-medium hover:bg-[#EEF2FF] hover:text-[#1549B8]'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 w-full">
          {activeTab === 'info'    && <ProfileTab user={user} updateUser={updateUser} />}
          {activeTab === 'cvs'     && <CVTab />}
          {activeTab === 'applied' && <AppliedTab />}
          {activeTab === 'saved'   && <SavedTab />}
        </main>
      </div>
    </div>
  )
}
