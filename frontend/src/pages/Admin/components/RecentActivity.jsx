import { Clock, TrendingUp, UserPlus, Building2, Shield, Briefcase, FileCheck, Flag, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const ACTIVITY_COLORS = {
  new_user:     { bg: '#EEF2FF', text: '#1549B8' },
  new_employer: { bg: '#FFFBEB', text: '#D97706' },
  new_admin:    { bg: '#F0F0FF', text: '#7C3AED' },
  new_job:      { bg: '#ECFDF5', text: '#059669' },
  cv_score:     { bg: '#EEF2FF', text: '#1549B8' },
  report:       { bg: '#FEF2F2', text: '#DC2626' },
  application:  { bg: '#F0FDF4', text: '#16A34A' },
}

const ACTIVITY_ICONS = {
  new_user:     UserPlus,
  new_employer: Building2,
  new_admin:    Shield,
  new_job:      Briefcase,
  cv_score:     FileCheck,
  report:       Flag,
  application:  FileText,
}

const COLORS = ['#1549B8', '#7C3AED', '#F59E0B', '#EF4444']

// ── Donut chart ──────────────────────────────────────────────────────────────
export function DonutChart({ data }) {
  let cumulative = 0
  const r = 40, cx = 50, cy = 50, circumference = 2 * Math.PI * r

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 100 100" className="w-28 h-28 shrink-0" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth="14" />
        {data.map((d, i) => {
          const dash = (d.pct / 100) * circumference
          const offset = circumference - (cumulative / 100) * circumference
          cumulative += d.pct
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={COLORS[i % COLORS.length]} strokeWidth="14"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={offset} strokeLinecap="butt" />
          )
        })}
      </svg>
      <div className="space-y-1.5 flex-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span className="text-[#475569] flex-1 truncate">{d.grade || d.category}</span>
            <span className="font-bold text-[#0F172A]">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── User growth chart ─────────────────────────────────────────────────────────
export function UserGrowthChart({ userGrowth, overview }) {
  return (
    <Card className="lg:col-span-2 border-[#E2E8F0]">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-bold text-[#0F172A]"><TrendingUp className="inline h-4 w-4 mr-1.5" />Tăng trưởng người dùng</CardTitle>
          <div className="flex gap-3 text-xs text-[#94A3B8]">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#1549B8] inline-block" />Ứng viên</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED] inline-block" />NTD</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-3 h-28 items-end">
          {userGrowth.map((d, i) => {
            const maxC = Math.max(...userGrowth.map(x => x.candidates))
            const maxE = Math.max(...userGrowth.map(x => x.employers))
            const hC = (d.candidates / maxC) * 80
            const hE = (d.employers / maxE) * 80
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="w-full flex gap-0.5 items-end" style={{ height: 80 }}>
                  <div className="flex-1 rounded-t-sm bg-[#1549B8] transition-all" style={{ height: hC }} />
                  <div className="flex-1 rounded-t-sm bg-[#7C3AED] transition-all" style={{ height: hE }} />
                </div>
                <span className="text-[10px] text-[#94A3B8]">{d.month}</span>
              </div>
            )
          })}
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-[#F1F5F9]">
          <div className="text-center">
            <div className="text-lg font-black text-[#0F172A]">{overview.totalUsers?.toLocaleString()}</div>
            <div className="text-xs text-[#94A3B8]">Tổng ứng viên</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black text-[#7C3AED]">{overview.totalEmployers}</div>
            <div className="text-xs text-[#94A3B8]">Nhà tuyển dụng</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black text-[#059669]">+{overview.newUsersThisMonth}</div>
            <div className="text-xs text-[#94A3B8]">Mới tháng này</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Recent activity ────────────────────────────────────────────────────────────
export function RecentActivity({ recentActivities }) {
  return (
    <Card className="border-[#E2E8F0]">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-bold text-[#0F172A]"><Clock className="inline h-4 w-4 mr-1.5" />Hoạt động gần đây</CardTitle>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {recentActivities.map(act => {
            const s = ACTIVITY_COLORS[act.type] || ACTIVITY_COLORS.new_user
            const IconComp = ACTIVITY_ICONS[act.type] || UserPlus
            return (
              <div key={act.id} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0" style={{ backgroundColor: s.bg }}>
                  <IconComp className="h-4 w-4" style={{ color: s.text }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#0F172A] leading-snug">{act.message}</p>
                  <p className="text-[10px] text-[#94A3B8] mt-0.5 flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />{act.time}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
