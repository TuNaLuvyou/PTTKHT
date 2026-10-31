import { useState, useEffect } from 'react'
import { ClipboardList, Inbox, Eye, Hourglass, TrendingUp, FolderOpen } from 'lucide-react'
import Spinner from '@/components/common/Spinner'
import { employerService } from '../../services/employerService'
import StatCard from './components/StatCard'

const STATUS_CONFIG = {
  pending: { label: 'Chờ xem', color: '#F59E0B', bg: '#FEF3C7' },
  reviewing: { label: 'Đang xét', color: '#3B82F6', bg: '#DBEAFE' },
  interview: { label: 'Phỏng vấn', color: '#8B5CF6', bg: '#EDE9FE' },
  offered: { label: 'Đã offer', color: '#10B981', bg: '#D1FAE5' },
  rejected: { label: 'Từ chối', color: '#EF4444', bg: '#FEE2E2' },
}

function MiniBar({ value, max, color }) {
  return (
    <div className="flex-1 h-1.5 bg-muted rounded overflow-hidden">
      <div
        className="h-full rounded transition-all duration-700 ease-out"
        style={{ width: `${(value / max) * 100}%`, backgroundColor: color }}
      />
    </div>
  )
}

export default function EmployerDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    employerService.getDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <Spinner size="lg" color="muted" text="Đang tải dữ liệu..." />
    </div>
  )

  const maxChart = Math.max(...(stats?.applications_chart?.map(d => d.count) || [1]))
  const totalStatus = Object.values(stats?.status_breakdown || {}).reduce((a, b) => a + b, 0) || 1

  return (
    <div className="p-[32px_16px] max-w-[960px] mx-auto">
      {/* Stat cards */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3 mb-7">
        <StatCard
          icon={<ClipboardList size={20} />}
          label="Tin tuyển dụng"
          value={stats.total_jobs}
          sub={`${stats.active_jobs} đang hoạt động`}
          color="#3B82F6"
          to="/employer/jobs"
        />
        <StatCard
          icon={<Inbox size={20} />}
          label="Tổng ứng tuyển"
          value={stats.total_applications}
          sub={`${stats.pending_applications} chờ xử lý`}
          color="#8B5CF6"
        />
        <StatCard
          icon={<Eye size={20} />}
          label="Lượt xem JD"
          value={stats.total_views.toLocaleString()}
          color="#10B981"
        />
        <StatCard
          icon={<Hourglass size={20} />}
          label="Chờ xem xét"
          value={stats.pending_applications}
          sub="Cần xử lý"
          color="#F59E0B"
        />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5 mb-5">
        {/* Chart */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="font-bold text-[15px] text-[#0F172A] mb-5 flex items-center gap-1.5">
            <TrendingUp size={18} /> Ứng tuyển 7 ngày qua
          </h3>
          <div className="flex items-end gap-2 h-[120px]">
            {stats.applications_chart.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground font-semibold">{d.count}</span>
                <div
                  className="w-full rounded-t min-h-[4px] transition-all duration-600 ease-out bg-gradient-to-b from-blue-500 to-blue-800"
                  style={{
                    height: `${(d.count / maxChart) * 90}px`,
                  }}
                />
                <span className="text-[10px] text-slate-300">{d.date.split('/')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <h3 className="font-bold text-[15px] text-[#0F172A] mb-5 flex items-center gap-1.5">
            <FolderOpen size={18} /> Trạng thái ứng viên
          </h3>
          <div className="flex flex-col gap-3.5">
            {Object.entries(stats.status_breakdown).map(([key, count]) => {
              const cfg = STATUS_CONFIG[key]
              return (
                <div key={key} className="flex items-center gap-2.5">
                  <span
                    className="text-xs font-semibold w-20 shrink-0"
                    style={{ color: cfg.color }}
                  >
                    {cfg.label}
                  </span>
                  <MiniBar value={count} max={totalStatus} color={cfg.color} />
                  <span className="text-sm font-bold text-[#0F172A] w-6 text-right shrink-0">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
