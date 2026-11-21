import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Lock, CheckCircle, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authService } from '@/services/authService'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    setLoading(true)
    try {
      await authService.resetPassword(token, password)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err?.message || 'Có lỗi xảy ra. Token có thể đã hết hạn.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Liên kết không hợp lệ</h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng gửi yêu cầu mới.
          </p>
          <Link to="/forgot-password" className="text-[#1549B8] font-bold text-sm hover:underline">
            Gửi yêu cầu mới
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Đặt lại mật khẩu thành công!</h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Mật khẩu của bạn đã được cập nhật. Bạn sẽ được chuyển hướng đến trang đăng nhập...
          </p>
          <Link to="/login" className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-[#1549B8] hover:bg-[#1240A0] text-white font-bold text-sm">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
          <Lock className="h-7 w-7 text-[#1549B8]" />
        </div>

        <h1 className="text-2xl font-black text-slate-900 mb-2">Đặt lại mật khẩu</h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          Nhập mật khẩu mới cho tài khoản của bạn.
        </p>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Mật khẩu mới</label>
            <Input
              type="password"
              placeholder="Ít nhất 6 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-12 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Xác nhận mật khẩu</label>
            <Input
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="h-12 rounded-xl"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !password || !confirmPassword}
            className="w-full h-12 rounded-xl bg-[#1549B8] hover:bg-[#1240A0] text-white font-bold text-sm"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang xử lý...</>
            ) : (
              'Đặt lại mật khẩu'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
