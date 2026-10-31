import { cn } from '@/lib/utils'

const base = 'animate-pulse bg-slate-200 rounded'

const variants = {
  text:    `${base} h-4 w-full`,
  title:   `${base} h-6 w-1/2`,
  subtitle:`${base} h-3.5 w-3/4`,
  avatar:  `${base} h-10 w-10 rounded-full shrink-0`,
  icon:    `${base} h-9 w-9 rounded-lg shrink-0`,
  badge:   `${base} h-5 w-16 rounded-full`,
  button:  `${base} h-10 w-24 rounded-xl`,
  chip:    `${base} h-6 w-14 rounded-full`,
  chart:   `${base} h-[260px] w-full rounded-xl`,
}

export default function Skeleton({ variant = 'text', className }) {
  const cls = variants[variant] || variants.text
  return <div className={cn(cls, className)} />
}

// ─── Card Skeleton ─────────────────────────────────────────────────────────
export function SkeletonCard({ lines = 3, avatar = false, badge = false, className }) {
  return (
    <div className={cn('bg-white rounded-2xl border border-slate-200 p-4 space-y-3', className)}>
      <div className="flex items-start gap-4">
        {avatar && <Skeleton variant="avatar" />}
        <div className="flex-1 space-y-2.5">
          <Skeleton variant="title" />
          <Skeleton variant="text" />
          {lines > 2 && <Skeleton variant="subtitle" />}
        </div>
        {badge && <Skeleton variant="badge" />}
      </div>
      {lines > 3 && (
        <div className="space-y-2 pt-1">
          {Array.from({ length: lines - 3 }).map((_, i) => (
            <Skeleton key={i} variant="text" className={i === lines - 4 ? 'w-2/3' : ''} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Table Row Skeleton ────────────────────────────────────────────────────
export function SkeletonTableRow({ columns = 4, className }) {
  return (
    <div className={cn('flex items-center gap-4 py-3 px-4 border-b border-slate-100', className)}>
      <Skeleton variant="avatar" />
      <div className="flex-1 grid grid-cols-3 gap-4">
        {Array.from({ length: columns - 1 }).map((_, i) => (
          <Skeleton key={i} variant="text" className={i === 0 ? 'w-3/4' : ''} />
        ))}
      </div>
    </div>
  )
}

// ─── Job Card Skeleton ─────────────────────────────────────────────────────
export function SkeletonJobCard({ className }) {
  return (
    <div className={cn('bg-white rounded-2xl border border-slate-200 p-5 space-y-4', className)}>
      <div className="flex items-start gap-4">
        <Skeleton variant="icon" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="title" className="w-3/4" />
          <Skeleton variant="subtitle" />
          <div className="flex gap-3 pt-1">
            <Skeleton variant="chip" />
            <Skeleton variant="chip" />
            <Skeleton variant="chip" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Skeleton variant="badge" />
          <Skeleton variant="text" className="w-12" />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Skeleton variant="chip" />
        <Skeleton variant="chip" />
        <Skeleton variant="chip" className="w-20" />
      </div>
      <div className="flex justify-between pt-2 border-t border-slate-100">
        <Skeleton variant="subtitle" className="w-1/3" />
        <Skeleton variant="text" className="w-24" />
      </div>
    </div>
  )
}

// ─── Page Skeleton ─────────────────────────────────────────────────────────
export function SkeletonPage({ cards = 4, cardType = 'card', className }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: cards }).map((_, i) => (
        cardType === 'job-card'
          ? <SkeletonJobCard key={i} />
          : <SkeletonCard key={i} lines={3} avatar />
      ))}
    </div>
  )
}
