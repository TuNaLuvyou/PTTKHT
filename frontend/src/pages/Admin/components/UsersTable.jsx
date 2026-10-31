import { UserX, UserCheck, Eye, Trash2, Shield, Building2, MapPin, Clock, Mail, Phone, Briefcase, FileText, Users, User, CircleCheck, CircleX, CircleAlert, Loader2 } from 'lucide-react'
import EmptyState from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { SkeletonCard } from '@/components/common/Skeleton'

const STATUS_STYLE = {
  active:  { label: 'Hoạt động', bg: '#ECFDF5', text: '#059669', border: '#A7F3D0', icon: CircleCheck },
  banned:  { label: 'Bị cấm',    bg: '#FEF2F2', text: '#DC2626', border: '#FECACA', icon: CircleX },
  pending: { label: 'Chờ duyệt', bg: '#FFFBEB', text: '#D97706', border: '#FDE68A', icon: CircleAlert },
}

const initials = name => name?.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase() || 'U'
const timeSince = iso => {
  if (!iso) return '—'
  const d = (Date.now() - new Date(iso)) / 1000
  if (d < 60) return 'Vừa xong'
  if (d < 3600) return `${Math.floor(d / 60)} phút trước`
  if (d < 86400) return `${Math.floor(d / 3600)} giờ trước`
  if (d < 2592000) return `${Math.floor(d / 86400)} ngày trước`
  return new Date(iso).toLocaleDateString('vi-VN')
}

// ─── Detail Dialog ─────────────────────────────────────────────────────────
export function UserDetailDialog({ user, open, onClose, onStatusChange, detailLoading = false }) {
  const [banReason, setBanReason] = useState('')
  const [showBanForm, setShowBanForm] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!user && !detailLoading) return null
  const s = user ? (STATUS_STYLE[user.status] || STATUS_STYLE.active) : STATUS_STYLE.active
  const StatusIcon = s.icon

  const handleBan = async () => {
    if (!user) return
    setLoading(true)
    await onStatusChange(user.id, 'banned', banReason)
    setLoading(false); setShowBanForm(false); onClose()
  }
  const handleUnban = async () => {
    if (!user) return
    setLoading(true)
    await onStatusChange(user.id, 'active')
    setLoading(false); onClose()
  }
  const handleApprove = async () => {
    if (!user) return
    setLoading(true)
    await onStatusChange(user.id, 'active')
    setLoading(false); onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-black">Chi tiết người dùng</DialogTitle>
        </DialogHeader>

        {!user && detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : user ? (
        <>
        {/* User Info Header */}
        <div className="flex gap-5 items-start">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center font-black text-xl text-blue-700 shrink-0 shadow-sm border border-blue-200">
            {initials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-bold text-lg text-slate-900">{user.name}</h3>
              <span
                className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1"
                style={{ backgroundColor: s.bg, color: s.text, borderColor: s.border }}
              >
                <StatusIcon size={12} /> {s.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <Mail size={14} className="text-slate-400" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center gap-1"><Phone size={12} /> {user.phone || '—'}</span>
              <span className="flex items-center gap-1"><MapPin size={12} /> {user.location || '—'}</span>
            </div>
          </div>
          <Badge variant="outline" className={`text-xs font-bold px-3 py-1 flex items-center gap-1 ${
            user.role === 'candidate' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' 
            : user.role === 'admin' ? 'text-amber-600 border-amber-200 bg-amber-50'
            : 'text-violet-600 border-violet-200 bg-violet-50'
          }`}>
            {user.role === 'candidate' ? <><User size={12} /> Ứng viên</> 
            : user.role === 'admin' ? <><Shield size={12} /> Quản trị viên</> 
            : <><Building2 size={12} /> Nhà tuyển dụng</>}
          </Badge>
        </div>

        <Separator className="my-1" />

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {user.role === 'candidate' ? (
            <>
              <StatBox value={user.cvCount} label="CV đã chấm" icon={<FileText size={14} />} />
              <StatBox value={user.appliedJobs} label="Đã ứng tuyển" icon={<Briefcase size={14} />} />
              <StatBox value={user.savedJobs} label="Việc đã lưu" icon={<Clock size={14} />} />
            </>
          ) : (
            <>
              <StatBox value={user.postedJobs} label="Tin đã đăng" icon={<Briefcase size={14} />} />
              <StatBox value={user.totalApplicants || 0} label="Ứng viên" icon={<UserCheck size={14} />} />
              <StatBox value={user.companySize || '—'} label="Quy mô" icon={<Building2 size={14} />} />
            </>
          )}
        </div>

        {/* Company Info for Employers */}
        {user.role === 'employer' && user.companyName && (
          <div className="p-3 bg-violet-50 border border-violet-100 rounded-xl">
            <div className="flex items-center gap-2 text-sm">
              <Building2 size={16} className="text-violet-500" />
              <span className="font-bold text-violet-700">{user.companyName}</span>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg">
            <span className="text-slate-500 font-medium">Ngày đăng ký</span>
            <span className="font-semibold text-slate-700">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg">
            <span className="text-slate-500 font-medium">Đăng nhập gần nhất</span>
            <span className="font-semibold text-slate-700">{timeSince(user.lastLogin)}</span>
          </div>
          {user.banReason && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-2">
                <Shield size={16} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-red-700">Lý do cấm: </span>
                  <span className="text-xs text-red-600">{user.banReason}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ban Form */}
        {showBanForm && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <Label className="text-xs font-bold text-red-700 mb-2 block">Lý do cấm tài khoản *</Label>
            <Textarea
              rows={2}
              value={banReason}
              onChange={e => setBanReason(e.target.value)}
              placeholder="VD: Vi phạm điều khoản sử dụng..."
              className="text-sm rounded-xl border-red-200 focus:border-red-400"
            />
          </div>
        )}

        {/* Action Buttons */}
        <DialogFooter className="gap-2 flex-wrap">
          {user.status === 'pending' && (
            <Button onClick={handleApprove} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 flex-1 rounded-xl h-11">
              <UserCheck className="h-4 w-4" /> Duyệt tài khoản
            </Button>
          )}
          {user.status === 'active' && !showBanForm && (
            <Button variant="destructive" onClick={() => setShowBanForm(true)} className="gap-1.5 flex-1 rounded-xl h-11">
              <UserX className="h-4 w-4" /> Cấm tài khoản
            </Button>
          )}
          {user.status === 'active' && showBanForm && (
            <Button variant="destructive" onClick={handleBan} disabled={loading || !banReason.trim()} className="gap-1.5 flex-1 rounded-xl h-11">
              <UserX className="h-4 w-4" /> Xác nhận cấm
            </Button>
          )}
          {user.status === 'banned' && (
            <Button onClick={handleUnban} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 flex-1 rounded-xl h-11">
              <UserCheck className="h-4 w-4" /> Mở cấm tài khoản
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl h-11">Đóng</Button>
        </DialogFooter>
        </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function StatBox({ value, label, icon }) {
  return (
    <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
      <div className="font-black text-lg text-slate-800">{value}</div>
      <div className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1 mt-0.5">
        {icon} {label}
      </div>
    </div>
  )
}

// ─── User Card Row ─────────────────────────────────────────────────────────
function UserCard({ user, onView, onStatusChange, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const s = STATUS_STYLE[user.status] || STATUS_STYLE.active
  const StatusIcon = s.icon

  const handleAction = async (fn, ...args) => {
    setActionLoading(true)
    try { await fn(...args) } finally { setActionLoading(false); setMenuOpen(false) }
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200 ${
        actionLoading ? 'opacity-60' : ''
      }`}
      style={{ cursor: 'default' }}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center font-bold text-sm text-blue-700 shrink-0 shadow-sm border border-blue-200">
          {initials(user.name)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-[15px] font-bold text-slate-900">{user.name}</span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-0.5"
              style={{ backgroundColor: s.bg, color: s.text, borderColor: s.border }}
            >
              <StatusIcon size={10} /> {s.label}
            </span>
            <Badge variant="outline" className={`text-[10px] font-bold px-1.5 py-0 ${
              user.role === 'candidate'
                ? 'text-emerald-600 border-emerald-200 bg-emerald-50/50'
                : user.role === 'admin'
                  ? 'text-amber-600 border-amber-200 bg-amber-50/50'
                  : 'text-violet-600 border-violet-200 bg-violet-50/50'
            }`}>
              {user.role === 'candidate' ? 'Ứng viên' : user.role === 'admin' ? 'Admin' : 'NTD'}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Mail size={11} /> {user.email}
            <span className="mx-1">·</span>
            <MapPin size={11} /> {user.location || '—'}
          </p>
          {user.role === 'employer' && user.companyName && (
            <p className="text-xs font-semibold text-violet-600 mt-0.5 flex items-center gap-1">
              <Building2 size={11} /> {user.companyName}
            </p>
          )}
        </div>

        {/* Last Login + Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
            <Clock size={12} />
            <span>{timeSince(user.lastLogin)}</span>
          </div>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-400"
            >
              <span className="text-lg leading-none">⋯</span>
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-11 z-50 bg-white rounded-xl border border-slate-200 shadow-xl min-w-[180px] overflow-hidden"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <MenuBtn icon={<Eye size={14} />} label="Xem chi tiết" onClick={() => { onView(user); setMenuOpen(false) }} />
                {user.status === 'pending' && (
                  <MenuBtn icon={<UserCheck size={14} />} label="Duyệt tài khoản" onClick={() => handleAction(onStatusChange, user.id, 'active')} />
                )}
                {user.status === 'active' && (
                  <MenuBtn icon={<UserX size={14} />} label="Cấm tài khoản" onClick={() => handleAction(onStatusChange, user.id, 'banned', '')} danger />
                )}
                {user.status === 'banned' && (
                  <MenuBtn icon={<UserCheck size={14} />} label="Mở cấm" onClick={() => handleAction(onStatusChange, user.id, 'active')} />
                )}
                <div className="border-t border-slate-100" />
                <MenuBtn icon={<Trash2 size={14} />} label="Xóa vĩnh viễn" danger onClick={() => { onDelete(user.id); setMenuOpen(false) }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MenuBtn({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-2.5 transition-colors ${
        danger
          ? 'text-red-600 hover:bg-red-50'
          : 'text-slate-700 hover:bg-slate-50'
      }`}
    >
      <span className={danger ? 'text-red-400' : 'text-slate-400'}>{icon}</span>
      {label}
    </button>
  )
}

// ─── Empty State helper ───────────────────────────────────────────────────
function getEmptyMessage(role, keyword) {
  if (keyword) return 'Không tìm thấy người dùng nào khớp với từ khóa tìm kiếm'
  if (role === 'candidate') return 'Chưa có ứng viên nào trong hệ thống'
  if (role === 'employer') return 'Chưa có nhà tuyển dụng nào trong hệ thống'
  return 'Chưa có người dùng nào trong hệ thống'
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map(i => (
        <SkeletonCard key={i} lines={3} avatar badge />
      ))}
    </div>
  )
}

// ─── Main UsersTable ──────────────────────────────────────────────────────
export function UsersTable({ users, loading, onView, onStatusChange, onDelete, role, onRoleChange, counts, keyword = '' }) {
  const tabs = [
    { key: 'all', label: `Tất cả (${counts.all})`, icon: Users },
    { key: 'candidate', label: `Ứng viên (${counts.candidate})`, icon: User },
    { key: 'employer', label: `Nhà tuyển dụng (${counts.employer})`, icon: Building2 },
  ]

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map(tab => {
          const TabIcon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => onRoleChange(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
                role === tab.key
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <TabIcon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* User Cards */}
      {loading ? (
        <LoadingSkeleton />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title={getEmptyMessage(role, keyword)}
          description="Khi có người dùng mới đăng ký, họ sẽ xuất hiện ở đây"
        />
      ) : (
        <div className="space-y-3">
          {users.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onView={onView}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* Count footer */}
      {!loading && users.length > 0 && (
        <div className="mt-4 text-center text-xs text-slate-400 font-medium">
          Hiển thị {users.length} / {counts.all} người dùng
        </div>
      )}
    </div>
  )
}
