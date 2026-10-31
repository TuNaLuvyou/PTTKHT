import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ChartPie, Briefcase, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { adminService } from '@/services/adminService'
import { StatsRow, DashboardHeader } from './components/StatsCards'
import { DonutChart, UserGrowthChart, RecentActivity } from './components/RecentActivity'
import { connectSocket, onDashboardUpdateNeeded } from '@/services/socket'
import Spinner from '@/components/common/Spinner'

export default function AdminDashboardPage() {
  const [data, setData] = useState(null)

  const fetchDashboard = useCallback(() => {
    adminService.getDashboard().then(setData)
  }, [])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  // Realtime: lắng nghe sự kiện cần refresh dashboard (người dùng mới đăng ký, ...)
  useEffect(() => {
    connectSocket()
    const cleanup = onDashboardUpdateNeeded(() => {
      fetchDashboard()
    })
    return cleanup
  }, [fetchDashboard])

  if (!data) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" color="primary" />
    </div>
  )

  const { overview, userGrowth, jobsByCategory, cvScoreDistribution, topLocations, recentActivities } = data

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader />
      <StatsRow overview={overview} />

      {/* Pending alert */}
      {overview.pendingEmployers > 0 || overview.pendingJobs > 0 || overview.reportedJobs > 0 ? (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              Cần xử lý:
              {overview.pendingEmployers > 0 && (
                <span className="text-amber-600"> {overview.pendingEmployers} nhà tuyển dụng chờ xác minh</span>
              )}
              {overview.pendingEmployers > 0 && (overview.pendingJobs > 0 || overview.reportedJobs > 0) && <span> ·</span>}
              {overview.pendingJobs > 0 && (
                <span className="text-amber-600"> {overview.pendingJobs} tin tuyển dụng chờ duyệt</span>
              )}
              {overview.pendingJobs > 0 && overview.reportedJobs > 0 && <span> ·</span>}
              {overview.reportedJobs > 0 && (
                <span className="text-red-600"> {overview.reportedJobs} tin bị báo cáo</span>
              )}
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 shrink-0">
            <Link to="/admin/jobs?status=pending">Xem ngay</Link>
          </Button>
        </div>
      ) : null}

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-5">
        <UserGrowthChart userGrowth={userGrowth} overview={overview} />
        <Card className="border-[#E2E8F0]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-[#0F172A]"><ChartPie className="inline h-4 w-4 mr-1.5" />Phân phối điểm CV</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <DonutChart data={cvScoreDistribution} />
            <Separator className="my-3" />
            <div className="text-center">
              <div className="text-2xl font-black text-[#1549B8]">{overview.avgCVScore}</div>
              <div className="text-xs text-[#94A3B8]">Điểm trung bình</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Jobs by category */}
        <Card className="border-[#E2E8F0]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-[#0F172A]"><Briefcase className="inline h-4 w-4 mr-1.5" />Tin theo ngành nghề</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2.5">
            {jobsByCategory.map((cat, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#475569] truncate flex-1">{cat.category}</span>
                  <span className="font-bold text-[#0F172A] ml-2">{cat.count?.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#1549B8] transition-all duration-700" style={{ width: `${cat.pct}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top locations */}
        <Card className="border-[#E2E8F0]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-[#0F172A]"><MapPin className="inline h-4 w-4 mr-1.5" />Theo địa điểm</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {topLocations.map((loc, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#EEF2FF] flex items-center justify-center text-xs font-black text-[#1549B8] shrink-0">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#0F172A] truncate">{loc.city}</div>
                    <div className="text-xs text-[#94A3B8]">{loc.jobs?.toLocaleString()} việc · {loc.users} NTD</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <RecentActivity recentActivities={recentActivities} />
      </div>
    </div>
  )
}