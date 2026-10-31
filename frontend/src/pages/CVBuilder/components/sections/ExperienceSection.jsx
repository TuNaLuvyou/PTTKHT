import { Plus, Trash2, Briefcase } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Section } from '../Section'
import { uid } from '../constants'

const EMPTY_EXPERIENCE = { company: '', role: '', period: '', location: '', bullets: [''] }

export function ExperienceSection({ items, onChange }) {
  const update = (id, key, val) =>
    onChange((cv) => ({
      ...cv,
      experience: cv.experience.map((e) => (e.id === id ? { ...e, [key]: val } : e)),
    }))

  const remove = (id) =>
    onChange((cv) => ({ ...cv, experience: cv.experience.filter((e) => e.id !== id) }))

  const add = () =>
    onChange((cv) => ({
      ...cv,
      experience: [...cv.experience, { id: uid(), ...EMPTY_EXPERIENCE }],
    }))

  const setBullet = (expId, idx, val) =>
    onChange((cv) => ({
      ...cv,
      experience: cv.experience.map((e) =>
        e.id === expId
          ? { ...e, bullets: e.bullets.map((b, i) => (i === idx ? val : b)) }
          : e
      ),
    }))

  const addBullet = (expId) =>
    onChange((cv) => ({
      ...cv,
      experience: cv.experience.map((e) =>
        e.id === expId ? { ...e, bullets: [...e.bullets, ''] } : e
      ),
    }))

  const removeBullet = (expId, idx) =>
    onChange((cv) => ({
      ...cv,
      experience: cv.experience.map((e) =>
        e.id === expId
          ? { ...e, bullets: e.bullets.filter((_, i) => i !== idx) }
          : e
      ),
    }))

  return (
    <Section title="Kinh nghiệm làm việc" icon={<Briefcase className="h-4 w-4 text-[#1549B8]" />}>
      {items.map((exp) => (
        <div key={exp.id} className="bg-[#F8FAFC] rounded-2xl p-4 space-y-3 relative">
          <button
            type="button"
            onClick={() => remove(exp.id)}
            className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { key: 'company', label: 'Công ty / Tổ chức *' },
              { key: 'role', label: 'Vị trí đảm nhiệm *' },
              { key: 'period', label: 'Thời gian (VD: 2022 - Nay)' },
              { key: 'location', label: 'Địa điểm' },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">{label}</Label>
                <Input
                  value={exp[key] ?? ''}
                  onChange={(e) => update(exp.id, key, e.target.value)}
                  className="h-8 text-xs rounded-xl bg-white border-slate-200 focus:border-[#1549B8] focus:ring-2 focus:ring-[#1549B8]/20"
                />
              </div>
            ))}
          </div>

          {/* Bullets */}
          <div className="space-y-1.5 pt-1">
            <Label className="text-xs font-semibold text-slate-700">Mô tả công việc & Thành tích</Label>
            {exp.bullets.map((b, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <span className="text-slate-400 text-xs font-bold">•</span>
                <Input
                  value={b}
                  onChange={(e) => setBullet(exp.id, idx, e.target.value)}
                  className="h-8 text-xs rounded-xl bg-white border-slate-200 focus:border-[#1549B8] focus:ring-2 focus:ring-[#1549B8]/20 flex-1"
                  placeholder="Mô tả kết quả đạt được..."
                />
                {exp.bullets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBullet(exp.id, idx)}
                    className="text-slate-400 hover:text-rose-600 shrink-0 cursor-pointer p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => addBullet(exp.id)}
              className="text-xs text-[#1549B8] hover:underline font-semibold flex items-center gap-1 pt-1 cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              <span>Thêm dòng mô tả</span>
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="w-full h-10 rounded-xl bg-[#EEF2FF] text-[#1549B8] text-xs font-bold hover:bg-[#E0E7FF] transition-colors flex items-center justify-center gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" />
        Thêm kinh nghiệm
      </button>
    </Section>
  )
}
