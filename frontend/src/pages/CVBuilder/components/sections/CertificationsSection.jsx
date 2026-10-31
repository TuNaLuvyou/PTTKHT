import { Plus, Trash2, Trophy } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Section } from '../Section'
import { uid } from '../constants'

const EMPTY_CERT = { name: '', issuer: '', year: '' }

export function CertificationsSection({ items, onChange }) {
  const update = (id, key, val) =>
    onChange((cv) => ({
      ...cv,
      certifications: cv.certifications.map((c) => (c.id === id ? { ...c, [key]: val } : c)),
    }))

  const remove = (id) =>
    onChange((cv) => ({ ...cv, certifications: cv.certifications.filter((c) => c.id !== id) }))

  const add = () =>
    onChange((cv) => ({
      ...cv,
      certifications: [...cv.certifications, { id: uid(), ...EMPTY_CERT }],
    }))

  return (
    <Section title="Chứng chỉ & Bằng cấp" icon={<Trophy className="h-4 w-4 text-[#1549B8]" />}>
      <div className="space-y-2">
        {items.map((c) => (
          <div key={c.id} className="flex gap-2 items-center">
            <Input
              value={c.name}
              onChange={(e) => update(c.id, 'name', e.target.value)}
              className="h-8 text-xs flex-1 rounded-xl border-slate-200 focus:border-[#1549B8] focus:ring-2 focus:ring-[#1549B8]/20"
              placeholder="Tên chứng chỉ (VD: AWS Certified Developer)"
            />
            <Input
              value={c.issuer}
              onChange={(e) => update(c.id, 'issuer', e.target.value)}
              className="h-8 text-xs w-32 shrink-0 rounded-xl border-slate-200 focus:border-[#1549B8] focus:ring-2 focus:ring-[#1549B8]/20"
              placeholder="Nơi cấp"
            />
            <Input
              value={c.year}
              onChange={(e) => update(c.id, 'year', e.target.value)}
              className="h-8 text-xs w-20 shrink-0 rounded-xl border-slate-200 focus:border-[#1549B8] focus:ring-2 focus:ring-[#1549B8]/20"
              placeholder="Năm"
            />
            <button
              type="button"
              onClick={() => remove(c.id)}
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
        Thêm chứng chỉ
      </button>
    </Section>
  )
}
