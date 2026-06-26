import { motion } from 'framer-motion'
import { useId, type ReactNode } from 'react'

/* Animated SVG progress ring with centered content */
export function ProgressRing({
  value,
  size = 96,
  stroke = 9,
  color = 'var(--accent)',
  track = 'var(--line)',
  children,
}: {
  value: number
  size?: number
  stroke?: number
  color?: string
  track?: string
  children?: ReactNode
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(1, value))
  return (
    <div className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - v) }}
          transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center leading-none">{children}</div>
    </div>
  )
}

/* SVG area chart with gradient fill + animated stroke line */
export function AreaChart({ data, height = 60, strokeWidth = 1.6 }: { data: number[]; height?: number; strokeWidth?: number }) {
  const id = useId().replace(/[:]/g, '')
  const W = 100
  const H = height
  const max = Math.max(...data, 1)
  const n = data.length
  if (n === 0) return <div style={{ height }} />
  const pts = data.map((d, i) => [n === 1 ? 0 : (i / (n - 1)) * W, H - (d / max) * (H - 6) - 3])
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ')
  const area = `${line} L ${W} ${H} L 0 ${H} Z`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height={H} className="block">
      <defs>
        <linearGradient id={`ag${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path d={area} fill={`url(#ag${id})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }} />
      <motion.path
        d={line}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}
      />
    </svg>
  )
}

/* Tonal donut (segments shaded from the accent → surface) with centered content */
export function Donut({
  segments,
  size = 124,
  thickness = 16,
  children,
}: {
  segments: { value: number }[]
  size?: number
  thickness?: number
  children?: ReactNode
}) {
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  let acc = 0
  return (
    <div className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={thickness} />
        {segments.map((seg, i) => {
          const frac = seg.value / total
          const gap = 0.012
          const dash = Math.max(0, (frac - gap) * c)
          const off = -acc * c
          acc += frac
          const mix = Math.max(26, 94 - i * 13)
          return (
            <motion.circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={`color-mix(in srgb, var(--accent) ${mix}%, var(--surface))`}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={off}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center leading-none">{children}</div>
    </div>
  )
}

export function segmentShade(i: number) {
  const mix = Math.max(26, 94 - i * 13)
  return `color-mix(in srgb, var(--accent) ${mix}%, var(--surface))`
}
