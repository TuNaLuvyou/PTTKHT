import { cn } from '@/lib/utils'

const sizeMap = {
  xs: 'h-3.5 w-3.5 border-2',
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-[3px]',
  lg: 'h-8 w-8 border-[3px]',
  xl: 'h-10 w-10 border-4',
}

const colorMap = {
  primary: 'border-[#1549B8] border-t-transparent',
  blue: 'border-blue-600 border-t-transparent',
  muted: 'border-slate-300 border-t-transparent',
  white: 'border-white/30 border-t-white',
}

export default function Spinner({
  size = 'lg',
  color = 'primary',
  text,
  fullPage,
  className,
}) {
  const spinner = (
    <div
      className={cn(
        'rounded-full animate-spin',
        sizeMap[size] || sizeMap.lg,
        colorMap[color] || colorMap.primary,
        className,
      )}
    />
  )

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          {spinner}
          {text && <p className="text-slate-400 text-sm font-medium">{text}</p>}
        </div>
      </div>
    )
  }

  if (text) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8">
        {spinner}
        <p className="text-slate-400 text-sm font-medium">{text}</p>
      </div>
    )
  }

  return spinner
}
