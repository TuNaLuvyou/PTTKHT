import { Plus, Trash2, Wrench } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Section } from '../Section'
import { uid } from '../constants'

const EMPTY_SKILL = { category: '', items: '' }

export function SkillsSection({ items, onChange }) {
  const update = (id, key, val) =>
    onChange((cv) => ({
      ...cv,
      skills: cv.skills.map((s) => (s.id === id ? { ...s, [key]: val } : s)),
    }))

  const remove = (id) =>
    onChange((cv) => ({ ...cv, skills: cv.skills.filter((s) => s.id !== id) }))

  const add = () =>
    onChange((cv) => ({ ...cv, skills: [...cv.skills, { id: uid(), ...EMPTY_SKILL }] }))

  return (
    <Section title="Kỹ năng chuyên môn" icon={<Wrench className="h-4 w-4 text-[#1549B8]" />}>
      <div className="space-y-2">
        {items.map((s) => (
          <div key={s.id} className="flex gap-2 items-center">
            <Input
              value={s.category}
              onChange={(e) => update(s.id, 'category', e.target.value)}
              className="h-8 text-xs w-32 shrink-0 rounded-xl border-slate-200 focus:border-[#1549B8] focus:ring-2 focus:ring-[#1549B8]/20"
              placeholder="Nhóm (VD: Frontend)"
            />
            <Input
              value={s.items}
              onChange={(e) => update(s.id, 'items', e.target.value)}
              className="h-8 text-xs flex-1 rounded-xl border-slate-200 focus:border-[#1549B8] focus:ring-2 focus:ring-[#1549B8]/20"
              placeholder="React, TypeScript, Next.js..."
            />
            <button
              type="button"
              onClick={() => remove(s.id)}
              className="text-slate-400 hover:text-rose-600 shrink-0 cursor-pointer p-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="w-full h-10 rounded-xl bg-[#EEF2FF] text-[#1549B8] text-xs font-bold hover:bg-[#E0E7FF] transition-colors flex items-center justify-center gap-1.5 mt-1"
      >
        <Plus className="h-3.5 w-3.5" />
        Thêm nhóm kỹ năng
      </button>
    </Section>
  )
}
