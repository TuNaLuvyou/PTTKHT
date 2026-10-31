import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import EmployerHeader from './EmployerHeader'
import Footer from './Footer'
import Skeleton from '@/components/common/Skeleton'

// Route công khai — không cần đăng nhập
const PUBLIC_ROUTES = [
  '/employer',
  '/employer/login',
  '/employer/register',
]

export default function EmployerLayout({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isPublic = PUBLIC_ROUTES.includes(location.pathname)

  useEffect(() => {
    if (!loading && !isAuthenticated && !isPublic) {
      navigate('/employer/login', {
        state: { from: location.pathname },
        replace: true,
      })
    }
  }, [isAuthenticated, loading, isPublic])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <div className="h-16 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between">
          <Skeleton variant="icon" className="w-32 h-8" />
          <div className="flex gap-3">
            <Skeleton variant="button" />
            <Skeleton variant="avatar" />
          </div>
        </div>
        <div className="flex-1 p-6 space-y-4">
          <Skeleton variant="title" className="w-1/3" />
          <Skeleton variant="text" />
          <Skeleton variant="text" className="w-3/4" />
          <div className="grid grid-cols-3 gap-4 pt-4">
            <Skeleton variant="chart" className="h-40" />
            <Skeleton variant="chart" className="h-40" />
            <Skeleton variant="chart" className="h-40" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      <EmployerHeader />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
