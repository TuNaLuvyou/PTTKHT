import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}) {
  const Icon = icon || Inbox
  return (
    <div className={cn(
      "text-center py-14 bg-white rounded-xl border border-dashed border-slate-300",
      className,
    )}>
      <div className="mb-4 flex justify-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
          <Icon className="h-7 w-7 text-slate-300" />
        </div>
      </div>
      {title && (
        <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-slate-400 max-w-xs mx-auto">{description}</p>
      )}
      {action && (
        <div className="mt-5">{action}</div>
      )}
    </div>
  )
}
