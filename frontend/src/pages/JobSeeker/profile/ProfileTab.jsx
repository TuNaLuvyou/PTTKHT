import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Plus, Save, Pencil, FileText, Bookmark, Send, Wrench, MapPin, Mail, X, Check } from 'lucide-react'
import { cvService } from '@/services/cvService'
import { jobService } from '@/services/jobService'
import { authService } from '@/services/authService'

export function ProfileTab({ user, updateUser }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', location: user?.location || '', title: user?.title || '', bio: user?.bio || '' })
  const [saving, setSaving] = useState(false)
  const [skills, setSkills] = useState(user?.skills || [])
  const [newSkill, setNewSkill] = useState('')
  const [isAddingSkill, setIsAddingSkill] = useState(false)
  const [stats, setStats] = useState({ cvsCount: 0, savedCount: 0, appliedCount: 0 })
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  useEffect(() => {
    Promise.allSettled([
      cvService.getMyCVs().then(data => Array.isArray(data) ? data.length : (data?.data?.length || 0)),
      jobService.getSavedJobs().then(data => Array.isArray(data) ? data.length : (data?.data?.length || 0)),
      jobService.getAppliedJobs().then(data => Array.isArray(data) ? data.length : (data?.data?.length || 0)),
    ]).then(([cvs, saved, applied]) => {
      setStats({
        cvsCount: cvs.status === 'fulfilled' ? cvs.value : 0,
        savedCount: saved.status === 'fulfilled' ? saved.value : 0,
        appliedCount: applied.status === 'fulfilled' ? applied.value : 0,
      })
    })
  }, [])

  const addSkill = () => {
    const trimmed = newSkill.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed])
      setNewSkill('')
    }
  }

  const startAddSkill = () => {
    setIsAddingSkill(true)
    setNewSkill('')
  }

  const removeSkill = skill => setSkills(prev => prev.filter(s => s !== skill))

  const handleSave = async () => {
    setSaving(true)
    const data = { ...form, skills }
    updateUser(data)
    try {
      await authService.updateProfile(data)
    } catch (err) {
      console.error('[ProfileTab.handleSave] Lỗi cập nhật profile:', err)
    }
    await new Promise(r => setTimeout(r, 700))
    setEditing(false); setSaving(false); setIsAddingSkill(false)
  }

  const FIELDS = [
    { key: 'name',     label: 'Họ và tên',  type: 'text' },
    { key: 'phone',    label: 'Điện thoại', type: 'tel' },
    { key: 'location', label: 'Địa điểm',   type: 'text' },
    { key: 'title',    label: 'Chức danh',  type: 'text' },
  ]

  return (
    <div className="space-y-4">
      <section className="bg-white rounded-3xl p-5 md:p-6 shadow-sm">
        {/* Identity */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="min-w-0">
            <h2 className="text-xl font-black text-[#0F172A] leading-tight truncate">{user?.name}</h2>
            <p className="text-sm font-semibold text-[#1549B8] mt-0.5">
              {user?.title || 'Chưa cập nhật chức danh'}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-2">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />{user?.location || '—'}
              </span>
              <span className="inline-flex items-center gap-1 min-w-0">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{user?.email}</span>
              </span>
            </div>
          </div>

          <Button
            size="sm"
            onClick={editing ? handleSave : () => { setEditing(true); setIsAddingSkill(false) }}
            disabled={saving}
            className="rounded-xl h-9 px-3.5 bg-[#1549B8] hover:bg-[#1240A0] text-white shrink-0"
          >
            {saving
              ? <><Loader2 className="h-4 w-4 animate-spin" />Lưu...</>
              : editing
                ? <><Save className="h-4 w-4" />Lưu</>
                : <><Pencil className="h-4 w-4" />Chỉnh sửa</>}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {[
            { icon: FileText, value: stats.cvsCount, label: 'CV' },
            { icon: Bookmark, value: stats.savedCount, label: 'Đã lưu' },
            { icon: Send, value: stats.appliedCount, label: 'Ứng tuyển' },
          ].map(({ icon, value, label }) => {
            const IconComp = icon
            return (
              <div key={label} className="flex items-center gap-2.5 bg-[#F8FAFC] rounded-2xl px-3 py-3">
                <span className="w-9 h-9 rounded-xl bg-[#EEF2FF] text-[#1549B8] flex items-center justify-center shrink-0">
                  <IconComp className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-lg font-black text-[#0F172A] leading-none">{value}</p>
                  <p className="text-[11px] text-slate-500 mt-1 truncate">{label}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Info */}
        <div className="grid sm:grid-cols-2 gap-3">
          {FIELDS.map(({ key, label, type }) => (
            <div key={key}>
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                {label}
              </Label>
              {editing ? (
                <Input
                  type={type}
                  value={form[key]}
                  onChange={set(key)}
                  className="rounded-xl h-10 border-slate-200 bg-[#F8FAFC] focus:bg-white"
                />
              ) : (
                <div className="rounded-xl bg-[#F8FAFC] px-3.5 py-2.5">
                  <p className="text-sm font-semibold text-[#0F172A] truncate">{user?.[key] || '—'}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bio */}
        <div className="mt-3">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
            Giới thiệu
          </Label>
          {editing ? (
            <Textarea
              rows={3}
              value={form.bio}
              onChange={set('bio')}
              placeholder="Vài dòng giới thiệu..."
              className="rounded-xl border-slate-200 bg-[#F8FAFC] focus:bg-white resize-none"
            />
          ) : (
            <div className="rounded-xl bg-[#F8FAFC] px-3.5 py-3">
              <p className="text-sm text-slate-600 leading-relaxed">
                {user?.bio || 'Chưa cập nhật'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Skills */}
      <section className="bg-white rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="font-bold text-sm text-[#0F172A] flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#EEF2FF] text-[#1549B8] flex items-center justify-center">
              <Wrench className="h-3.5 w-3.5" />
            </span>
            Kỹ năng
          </h3>
          {editing && !isAddingSkill && (
            <button
              type="button"
              onClick={startAddSkill}
              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg bg-[#EEF2FF] text-[#1549B8] text-xs font-semibold hover:bg-[#E0E7FF] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />Thêm
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {skills.map(s => (
            <span
              key={s}
              className="inline-flex items-center gap-1 bg-[#EEF2FF] text-[#1549B8] rounded-lg px-2.5 py-1.5 text-xs font-semibold"
            >
              {s}
              {editing && (
                <button
                  type="button"
                  onClick={() => removeSkill(s)}
                  className="hover:bg-[#1549B8]/10 rounded-md p-0.5 transition-colors"
                  aria-label={`Xoá ${s}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
          {!skills.length && (
            <p className="text-sm text-slate-400">Chưa có kỹ năng</p>
          )}
        </div>

        {editing && isAddingSkill && (
          <div className="flex gap-2 mt-3">
            <Input
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addSkill() }}
              placeholder="Nhập kỹ năng..."
              className="h-9 text-sm flex-1 rounded-xl border-slate-200 bg-[#F8FAFC] focus:bg-white"
              autoFocus
            />
            <Button
              size="sm"
              className="h-9 px-3 rounded-xl bg-[#1549B8] hover:bg-[#1240A0] text-white gap-1"
              onClick={addSkill}
            >
              <Check className="h-3.5 w-3.5" />Thêm
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
