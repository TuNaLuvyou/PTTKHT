import { Plus, Trash2, Globe } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Section } from '../Section'
import { uid } from '../constants'

const EMPTY_LANGUAGE = { lang: '', level: '' }

export function LanguagesSection({ items, onChange }) {
  const update = (id, key, val) =>
    onChange((cv) => ({
      ...cv,
      languages: cv.languages.map((l) => (l.id === id ? { ...l, [key]: val } : l)),
    }))

  const remove = (id) =>
    onChange((cv) => ({ ...cv, languages: cv.languages.filter((l) => l.id !== id) }))

  const add = () =>
    onChange((cv) => ({ ...cv, languages: [...cv.languages, { id: uid(), ...EMPTY_LANGUAGE }] }))

  return (
    <Section title="Ngoại ngữ" icon={<Globe className="h-4 w-4 text-[#1549B8]" />}>
      <div className="space-y-2">
        {items.map((l) => (
          <div key={l.id} className="flex gap-2 items-center">
            <Input
              value={l.lang}
              onChange={(e) => update(l.id, 'lang', e.target.value)}
              className="h-8 text-xs w-32 rounded-xl border-slate-200 focus:border-[#1549B8] focus:ring-2 focus:ring-[#1549B8]/20"
              placeholder="Ngôn ngữ (VD: Tiếng Anh)"
            />
            <Input
              value={l.level}
              onChange={(e) => update(l.id, 'level', e.target.value)}
              className="h-8 text-xs flex-1 rounded-xl border-slate-200 focus:border-[#1549B8] focus:ring-2 focus:ring-[#1549B8]/20"
              placeholder="Trình độ (VD: IELTS 7.5 / Thành thạo)"
            />
            <button
              type="button"
              onClick={() => remove(l.id)}
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
        Thêm ngoại ngữ
      </button>
    </Section>
  )
}
