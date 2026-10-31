/**
 * RadarChart — biểu đồ radar SVG 4 chiều (Kỹ năng, Kinh nghiệm, Học vấn, Từ khóa)
 * Dùng để trực quan hóa điểm số đánh giá CV / năng lực ứng viên.
 */
export default function RadarChart({ skills, experience, education, keywords }) {
  const size = 260
  const center = size / 2
  const rMax = size * 0.34

  const categories = [
    { label: 'Kỹ năng', value: skills || 0 },
    { label: 'Kinh nghiệm', value: experience || 0 },
    { label: 'Học vấn', value: education || 0 },
    { label: 'Từ khóa', value: keywords || 0 },
  ]

  const angles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI]

  const getCoords = (index, value) => {
    const angle = angles[index]
    const r = (value / 100) * rMax
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    }
  }

  const gridLevels = [25, 50, 75, 100]

  const getGridPath = (level) => {
    const r = (level / 100) * rMax
    return angles
      .map((angle, i) => {
        const x = center + r * Math.cos(angle)
        const y = center + r * Math.sin(angle)
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ') + ' Z'
  }

  const scorePath = categories
    .map((cat, i) => {
      const { x, y } = getCoords(i, cat.value)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ') + ' Z'

  return (
    <div className="flex flex-col items-center bg-[#F8FAFC] rounded-xl p-5 border border-border w-full max-w-[340px]">
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} style={{ maxWidth: size, maxHeight: size }}>
        {/* Grid rings */}
        {gridLevels.map((level) => (
          <path
            key={level}
            d={getGridPath(level)}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="0.8"
            strokeDasharray={level === 100 ? '0' : '2,2'}
          />
        ))}

        {/* Axis lines */}
        {angles.map((angle, i) => {
          const xMax = center + rMax * Math.cos(angle)
          const yMax = center + rMax * Math.sin(angle)
          return (
            <line key={i} x1={center} y1={center} x2={xMax} y2={yMax} stroke="#E2E8F0" strokeWidth="1.5" />
          )
        })}

        {/* Labels */}
        {categories.map((cat, i) => {
          const angle = angles[i]
          const labelDist = rMax + 22
          const x = center + labelDist * Math.cos(angle)
          const y = center + labelDist * Math.sin(angle)

          let textAnchor = 'middle'
          let transform = undefined
          let dy = '0.3em'

          if (i === 1 || i === 3) {
            textAnchor = 'middle'
            transform = `rotate(-90, ${x}, ${y})`
            dy = '0.3em'
          } else {
            if (Math.cos(angle) > 0.1) textAnchor = 'start'
            else if (Math.cos(angle) < -0.1) textAnchor = 'end'
            if (Math.sin(angle) > 0.5) dy = '1em'
            else if (Math.sin(angle) < -0.5) dy = '-0.3em'
          }

          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor={textAnchor}
              dy={dy}
              transform={transform}
              style={{ fontSize: 11.5, fontWeight: 700, fill: '#475569' }}
            >
              {cat.label} ({cat.value})
            </text>
          )
        })}

        {/* Score area */}
        <path d={scorePath} fill="rgba(59, 130, 246, 0.2)" stroke="#3B82F6" strokeWidth="2" />

        {/* Score dots */}
        {categories.map((cat, i) => {
          const { x, y } = getCoords(i, cat.value)
          return <circle key={i} cx={x} cy={y} r="4" fill="#3B82F6" stroke="white" strokeWidth="2" />
        })}
      </svg>
    </div>
  )
}
