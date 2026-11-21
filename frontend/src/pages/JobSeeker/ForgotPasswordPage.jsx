import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle, Loader2, Frown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authService } from '@/services/authService'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null) // null | { found, sent, message }
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotFound(false)
    setResult(null)
    setLoading(true)
    try {
      const res = await authService.forgotPassword(email)
      if (res.found === false) {
        setNotFound(true)
      } else {
        setResult(res)
      }
      if (res?.resetToken) {
        // Dev mode: show token for testing
        console.log('Reset token (dev):', res.resetToken)
      }
    } catch (err) {
      setError(err?.message || 'Có lỗi xảy ra, vui lòng thử lại sau')
    } finally {
      setLoading(false)
    }
  }

  // ── Email không tồn tại ──
  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Frown className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Email không tìm thấy</h1>
          <p className="text-slate-500 leading-relaxed mb-2">
            Email <strong className="text-slate-700">{email}</strong> không tồn tại trong hệ thống của chúng tôi.
          </p>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Vui lòng kiểm tra lại email hoặc{' '}
            <Link to="/register" className="text-[#1549B8] font-semibold hover:underline">tạo tài khoản mới</Link>.
          </p>
          <button
            onClick={() => { setNotFound(false); setError('') }}
            className="text-[#1549B8] font-bold text-sm hover:underline"
          >
            Thử lại với email khác
          </button>
        </div>
      </div>
    )
  }

  // ── Đã gửi email thành công ──
  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Đã gửi yêu cầu!</h1>
          <p className="text-slate-500 leading-relaxed mb-2">
            Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến{' '}
            <strong className="text-slate-700">{email}</strong>.
          </p>
          <p className="text-xs text-slate-400 mb-6">
            Vui lòng kiểm tra hộp thư (và thư mục Spam) của bạn.
          </p>
          <Link to="/login" className="text-[#1549B8] font-bold text-sm hover:underline">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    )
  }

  // ── Form nhập email ──
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-8">
          <ArrowLeft size={16} /> Quay lại đăng nhập
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
            <Mail className="h-7 w-7 text-[#1549B8]" />
          </div>

          <h1 className="text-2xl font-black text-slate-900 mb-2">Quên mật khẩu?</h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            Nhập email bạn đã đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
          </p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !email}
              className="w-full h-12 rounded-xl bg-[#1549B8] hover:bg-[#1240A0] text-white font-bold text-sm"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang gửi...</>
              ) : (
                'Gửi yêu cầu'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
