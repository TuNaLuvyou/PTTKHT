import { Plus, Trash2, GraduationCap } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Section } from '../Section'
import { uid } from '../constants'

const EMPTY_EDUCATION = { school: '', degree: '', period: '', gpa: '' }

export function EducationSection({ items, onChange }) {
  const update = (id, key, val) =>
    onChange((cv) => ({
      ...cv,
      education: cv.education.map((e) => (e.id === id ? { ...e, [key]: val } : e)),
    }))

  const remove = (id) =>
    onChange((cv) => ({ ...cv, education: cv.education.filter((e) => e.id !== id) }))

  const add = () =>
    onChange((cv) => ({
      ...cv,
      education: [...cv.education, { id: uid(), ...EMPTY_EDUCATION }],
    }))

  return (
    <Section title="Học vấn" icon={<GraduationCap className="h-4 w-4 text-[#1549B8]" />}>
      {items.map((edu) => (
        <div key={edu.id} className="bg-[#F8FAFC] rounded-2xl p-4 space-y-2.5 relative">
          <button
            type="button"
            onClick={() => remove(edu.id)}
            className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="sm:col-span-2 space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Trường / Viện đào tạo *</Label>
              <Input
                value={edu.school}
                onChange={(e) => update(edu.id, 'school', e.target.value)}
                className="h-8 text-xs rounded-xl bg-white border-slate-200 focus:border-[#1549B8] focus:ring-2 focus:ring-[#1549B8]/20"
              />
            </div>
            {[
              { key: 'degree', label: 'Ngành học / Bằng cấp' },
              { key: 'period', label: 'Thời gian học' },
              { key: 'gpa', label: 'GPA / Điểm số' },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">{label}</Label>
                <Input
                  value={edu[key]}
                  onChange={(e) => update(edu.id, key, e.target.value)}
                  className="h-8 text-xs rounded-xl bg-white border-slate-200 focus:border-[#1549B8] focus:ring-2 focus:ring-[#1549B8]/20"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="w-full h-10 rounded-xl bg-[#EEF2FF] text-[#1549B8] text-xs font-bold hover:bg-[#E0E7FF] transition-colors flex items-center justify-center gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" />
        Thêm học vấn
      </button>
    </Section>
  )
}
