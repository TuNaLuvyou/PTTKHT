import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { adminService } from '@/services/adminService'

export default function AdminLoginPage() {
    const navigate = useNavigate()
    const { isAdmin, isAuthenticated } = useAuth()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass] = useState(false)

    // Tự động chuyển hướng nếu đã đăng nhập Admin
    useEffect(() => {
        if (isAuthenticated && isAdmin) {
            navigate('/admin')
        }
    }, [isAuthenticated, isAdmin, navigate])

    const set = k => e => { setForm(p => ({ ...p, [k]: e.target.value })); setError('') }

    const handleSubmit = async e => {
        e.preventDefault()
        if (!form.email || !form.password) { setError('Vui lòng điền đầy đủ thông tin'); return }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Email không đúng định dạng'); return }
        setLoading(true)
        try {
            const res = await adminService.login(form.email, form.password)
            
            // Cập nhật token
            localStorage.setItem('nexcv_token', res.token)
            
            // Chuyển hướng cứng để App.jsx nhận diện profile mới của Admin
            window.location.href = '/admin'
        } catch (err) {
            setError(err?.message || 'Đăng nhập thất bại')
        } finally { setLoading(false) }
    }

    return (
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#1549B8]/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl" />
                {/* Grid dots */}
                <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <circle cx="20" cy="20" r="1.5" fill="white" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            <div className="w-full max-w-md relative">
                {/* Card */}
                <div className="bg-[#1E293B] border border-white/10 rounded-2xl shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#1549B8] to-[#7C3AED] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-black text-white mb-1">Admin Portal</h1>
                        <p className="text-slate-400 text-sm">NexCV System Administration</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className={`mb-4 px-4 py-3 rounded-xl text-sm flex items-start gap-2.5 ${
                            error.includes('bị cấm')
                                ? 'bg-red-500/20 border border-red-500/40 text-red-300'
                                : 'bg-red-500/10 border border-red-500/30 text-red-400'
                        }`}>
                            {error.includes('bị cấm') ? (
                                <svg className="h-5 w-5 shrink-0 mt-0.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-1.964-.833-2.732 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            ) : (
                                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                            )}
                            <span className="leading-relaxed">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-slate-300 text-xs font-semibold">Email</Label>
                            <Input
                                type="email" value={form.email} onChange={set('email')}
                                placeholder="admin@nexcv.vn" autoComplete="email"
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:border-[#1549B8] focus-visible:ring-[#1549B8]/20 h-11"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-slate-300 text-xs font-semibold">Mật khẩu</Label>
                            <div className="relative">
                                <Input
                                    type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')}
                                    placeholder="••••••••" autoComplete="current-password"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:border-[#1549B8] focus-visible:ring-[#1549B8]/20 h-11 pr-11"
                                />
                                <button type="button" onClick={() => setShowPass(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit" disabled={loading}
                            className="w-full h-11 bg-gradient-to-r from-[#1549B8] to-[#7C3AED] hover:opacity-90 text-white font-bold text-sm mt-2"
                        >
                            {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Đang xác thực...</> : <><Shield className="h-4 w-4" />Đăng nhập Admin</>}
                        </Button>
                    </form>

                    <p className="text-center text-xs text-slate-600 mt-6">
                        Truy cập này được ghi nhật ký và giám sát.
                    </p>
                </div>

                {/* Back to site */}
                <div className="text-center mt-4">
                    <a href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                        ← Về trang chủ NexCV
                    </a>
                </div>
            </div>
        </div>
    )
}