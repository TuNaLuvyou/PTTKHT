/**
 * ScoreRing — vòng tròn điểm số SVG có animation.
 * Dùng để hiển thị điểm tổng quan (0-100) với màu sắc tự động theo mức điểm.
 */
export default function ScoreRing({ score, size = 120 }) {
  const r = (size - 14) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 85 ? '#10B981' : score >= 70 ? '#3B82F6' : score >= 55 ? '#F59E0B' : '#EF4444'
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black text-white" style={{ fontSize: size * 0.27 }}>{score}</span>
        <span className="text-white/70" style={{ fontSize: size * 0.1 }}>/100</span>
      </div>
    </div>
  )
}
