import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Bell, CheckCircle2, Info, AlertTriangle, 
  Trash2, MailOpen, Clock, Search, Filter
} from 'lucide-react'
import EmptyState from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { adminService } from '@/services/adminService'
import { connectSocket, onNotificationCreated, onNotificationRead, onAllNotificationsRead, onNotificationDeleted } from '@/services/socket'

export default function AdminNotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('all') // all, unread
  const [search, setSearch] = useState('')

  // Fetch từ API, fallback về localStorage
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await adminService.getNotifications();
      if (res?.data) {
        setNotifications(res.data);
        // Đồng bộ xuống localStorage để các component khác dùng được
        localStorage.setItem("nexcv_mock_notifications", JSON.stringify(res.data));
      }
    } catch (err) {
      console.debug('[AdminNotificationsPage.fetchNotifications] API lỗi, fallback localStorage:', err)
      const stored = localStorage.getItem("nexcv_mock_notifications");
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Kết nối WebSocket + lắng nghe sự kiện realtime
    connectSocket();

    const unsubCreated = onNotificationCreated((notification) => {
      setNotifications(prev => {
        const exists = prev.some(n => n.id === notification.id);
        if (exists) return prev;
        return [notification, ...prev];
      });
    });

    const unsubRead = onNotificationRead(({ id }) => {
      setNotifications(prev => prev.map(n =>
        n.id === id ? { ...n, unread: false } : n
      ));
    });

    const unsubReadAll = onAllNotificationsRead(() => {
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    });

    const unsubDeleted = onNotificationDeleted(({ id }) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    });

    // Đồng bộ khi có thay đổi từ tab/component khác (fallback)
    const handleStorage = (e) => {
      if (e.key === "nexcv_mock_notifications") {
        try { setNotifications(JSON.parse(e.newValue)); } catch (err) {
          console.debug('[AdminNotificationsPage.handleStorage] Lỗi parse storage event:', err)
        }
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      unsubCreated();
      unsubRead();
      unsubReadAll();
      unsubDeleted();
      window.removeEventListener("storage", handleStorage);
    };
  }, [fetchNotifications])

  const saveNotifications = (newNotifs) => {
    setNotifications(newNotifs)
    localStorage.setItem("nexcv_mock_notifications", JSON.stringify(newNotifs))
  }

  const markRead = async (id) => {
    // Cập nhật local ngay lập tức
    const updated = notifications.map(n => n.id === id ? { ...n, unread: false } : n)
    saveNotifications(updated)
    // Gọi API backend để đồng bộ (không await để UI không bị chờ)
    try {
      await adminService.markNotificationRead(id);
      fetchNotifications(); // Sync lại từ server để đồng bộ hoàn toàn
    } catch (err) {
      console.error('[AdminNotificationsPage.markRead] Lỗi API đánh dấu đã đọc:', err)
    }
  }

  const markAllRead = async () => {
    // Cập nhật local ngay lập tức
    const updated = notifications.map(n => ({ ...n, unread: false }))
    saveNotifications(updated)
    // Gọi API backend để đồng bộ
    try {
      await adminService.markAllNotificationsRead();
      fetchNotifications(); // Sync lại từ server để đồng bộ hoàn toàn
    } catch (err) {
      console.error('[AdminNotificationsPage.markAllRead] Lỗi API đánh dấu tất cả đã đọc:', err)
    }
  }

  const deleteNotif = async (id) => {
    const updated = notifications.filter(n => n.id !== id)
    saveNotifications(updated)
    // Gọi API backend để đồng bộ
    try {
      await adminService.deleteNotification(id);
      fetchNotifications(); // Sync lại từ server
    } catch (err) {
      console.error('[AdminNotificationsPage.deleteNotif] Lỗi API xóa thông báo:', err)
    }
  }

  const filtered = notifications.filter(n => {
    if (filter === 'unread' && !n.unread) return false
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.message.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleAction = (n) => {
    markRead(n.id)
    if (n.jobId) {
        navigate(`/admin/jobs/${n.jobId}`)
    } else if (n.title.includes('Tin tuyển dụng')) {
        navigate('/admin/jobs')
    } else if (n.title.includes('Người dùng')) {
        navigate('/admin/users')
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Trung tâm thông báo</h1>
          <p className="text-slate-500 mt-1">Quản lý các cập nhật và hoạt động trên hệ thống</p>
        </div>
        <div className="flex gap-2">
            <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl font-bold text-slate-600"
                onClick={markAllRead}
            >
                <MailOpen size={16} className="mr-2" /> Đánh dấu tất cả đã đọc
            </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Tìm kiếm thông báo..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200">
            <button 
                onClick={() => setFilter('all')}
                className={cn(
                    "px-6 py-2 rounded-xl text-xs font-bold transition-all",
                    filter === 'all' ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
                )}
            >
                Tất cả
            </button>
            <button 
                onClick={() => setFilter('unread')}
                className={cn(
                    "px-6 py-2 rounded-xl text-xs font-bold transition-all",
                    filter === 'unread' ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
                )}
            >
                Chưa đọc
            </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="Không có thông báo nào khớp với tìm kiếm"
              className="py-20"
            />
        ) : filtered.map(n => (
            <div 
                key={n.id}
                className={cn(
                    "group relative p-5 rounded-[24px] border transition-all flex gap-4",
                    n.unread ? "bg-blue-50/30 border-blue-100 shadow-sm" : "bg-white border-slate-100"
                )}
            >
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center",
                    n.type === 'success' ? "bg-emerald-100 text-emerald-600" :
                    n.type === 'warning' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                )}>
                    {n.type === 'success' ? <CheckCircle2 size={24} /> :
                     n.type === 'warning' ? <AlertTriangle size={24} /> : <Info size={24} />}
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                        <h4 className={cn("text-[15px] font-black", n.unread ? "text-slate-900" : "text-slate-700")}>
                            {n.title}
                        </h4>
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                            <Clock size={12} /> {n.time}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">{n.message}</p>
                    
                    <div className="flex gap-2">
                        <Button 
                            size="sm" 
                            className="rounded-xl px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold h-8 text-xs"
                            onClick={() => handleAction(n)}
                        >
                            Xem chi tiết
                        </Button>
                        {n.unread && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="rounded-xl px-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold h-8 text-xs"
                                onClick={() => markRead(n.id)}
                            >
                                Đánh dấu đã đọc
                            </Button>
                        )}
                    </div>
                </div>

                <button 
                    onClick={() => deleteNotif(n.id)}
                    className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        ))}
      </div>
    </div>
  )
}
