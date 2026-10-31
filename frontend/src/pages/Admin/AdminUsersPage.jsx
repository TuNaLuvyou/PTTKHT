import { useState, useEffect, useCallback } from 'react'
import { Search, Users, User, Building2, Hourglass, CheckCircle2, Trash2, X, Loader2 } from 'lucide-react'
import { adminService } from '@/services/adminService'
import { connectSocket, onDashboardUpdateNeeded } from '@/services/socket'
import { UsersTable, UserDetailDialog } from './components/UsersTable'

const QUICK_STATS = [
  { key: 'all', label: 'Tổng người dùng', icon: Users, color: '#1549B8', bg: '#EEF2FF' },
  { key: 'candidate', label: 'Ứng viên', icon: User, color: '#059669', bg: '#D1FAE5' },
  { key: 'employer', label: 'Nhà tuyển dụng', icon: Building2, color: '#7C3AED', bg: '#EDE9FE' },
  { key: 'pending', label: 'Chờ duyệt', icon: Hourglass, color: '#D97706', bg: '#FEF3C7' },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [role, setRole] = useState('all')
  const [status, setStatus] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [searchText, setSearchText] = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (keyword) params.keyword = keyword
      if (role !== 'all') params.role = role
      if (status !== 'all') params.status = status
      const res = await adminService.getUsers(params)
      setUsers(res.data || [])
    } finally {
      setLoading(false)
    }
  }, [keyword, role, status])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  // Realtime sync: refetch when dashboard data changes (new user, application, CV score, etc.)
  useEffect(() => {
    connectSocket()
    const cleanup = onDashboardUpdateNeeded(() => {
      fetchUsers()
    })
    return cleanup
  }, [fetchUsers])

  const handleViewUser = async (user) => {
    setDetailLoading(true)
    try {
      const res = await adminService.getUser(user.id)
      // getUser may return data directly (mock) or wrapped in axios response
      const freshData = res?.data || res
      setSelectedUser({ ...user, ...freshData })
    } catch (err) {
      console.debug('[AdminUsersPage.handleViewUser] API lỗi, dùng dữ liệu cache từ danh sách:', err)
      // Fallback to cached data from list if API fails
      setSelectedUser(user)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setKeyword(searchText)
  }

  const handleStatusChange = async (id, newStatus, reason) => {
    try {
      await adminService.updateUserStatus(id, newStatus, reason || '')
      setUsers(p => p.map(u => u.id === id ? { ...u, status: newStatus, ...(reason && { banReason: reason }) } : u))
      const labels = { active: 'Kích hoạt', banned: 'Cấm tài khoản', pending: 'Chờ duyệt' }
      showToast(`Đã cập nhật trạng thái: ${labels[newStatus] || newStatus}`)
    } catch (err) {
      showToast(err?.response?.data?.message || 'Lỗi cập nhật trạng thái', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Xác nhận xóa vĩnh viễn người dùng này? Hành động này không thể hoàn tác.')) return
    await adminService.deleteUser(id)
    setUsers(p => p.filter(u => u.id !== id))
    showToast('Đã xóa người dùng')
  }

  const counts = {
    all: users.length,
    candidate: users.filter(u => u.role === 'candidate').length,
    employer: users.filter(u => u.role === 'employer').length,
    pending: users.filter(u => u.status === 'pending').length,
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`mb-4 p-3 px-5 rounded-xl text-sm font-bold border shadow-sm transition-all flex items-center gap-2 ${
          toast.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {toast.type === 'error' ? <X className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý người dùng</h1>
        <p className="text-slate-500 mt-1 text-[15px]">
          Quản lý, kiểm soát và xác thực tài khoản người dùng trên hệ thống
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {QUICK_STATS.map(stat => {
          const Icon = stat.icon
          return (
            <div
              key={stat.key}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="h-5 w-5" style={{ color: stat.color }} />
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: stat.bg, color: stat.color }}
                >
                  {stat.key === 'all' ? '' : stat.label}
                </span>
              </div>
              <div className="text-2xl font-black" style={{ color: stat.color }}>
                {counts[stat.key] || 0}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                {stat.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Search & Filters */}
      <form onSubmit={handleSearch} className="mb-5">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="Tìm theo tên, email..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
            />
          </div>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="candidate">Ứng viên</option>
            <option value="employer">Nhà tuyển dụng</option>
          </select>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="banned">Bị cấm</option>
            <option value="pending">Chờ duyệt</option>
          </select>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            <Search className="h-4 w-4" /> Tìm
          </button>
          {(keyword || role !== 'all' || status !== 'all') && (
            <button
              type="button"
              onClick={() => { setSearchText(''); setKeyword(''); setRole('all'); setStatus('all'); }}
              className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 font-medium text-sm rounded-xl transition-colors flex items-center gap-1.5"
            >
              <X className="h-4 w-4" /> Xóa lọc
            </button>
          )}
        </div>
      </form>

      {/* Users Table / Cards */}
      <UsersTable
        users={users}
        loading={loading}
        role={role}
        onView={handleViewUser}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        onRoleChange={setRole}
        counts={counts}
        keyword={keyword}
      />

      {/* Detail Dialog */}
      <UserDetailDialog
        user={selectedUser}
        open={!!selectedUser || detailLoading}
        detailLoading={detailLoading}
        onClose={() => { setSelectedUser(null); setDetailLoading(false) }}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
