import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function Section({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-2xl bg-white shadow-sm overflow-hidden transition-all duration-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#F8FAFC] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5 text-sm font-bold text-[#0F172A]">
          <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] text-[#1549B8] flex items-center justify-center shrink-0">
            {icon}
          </div>
          <span>{title}</span>
        </div>
        <span className="w-7 h-7 rounded-lg bg-[#F8FAFC] flex items-center justify-center text-slate-400">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>
      {open && <div className="px-4 pb-4 pt-1 space-y-3">{children}</div>}
    </div>
  )
}
