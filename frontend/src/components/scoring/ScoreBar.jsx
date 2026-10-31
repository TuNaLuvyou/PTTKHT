export default function ScoreBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-xs text-muted-foreground w-[90px] shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded overflow-hidden">
        <div
          className="h-full rounded transition-all duration-700 ease-out"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold text-[#0F172A] w-7 text-right shrink-0">{value}</span>
    </div>
  )
}
