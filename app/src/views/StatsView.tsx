import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { CatIcon, catLabel } from '../categories'
import { MONTH_NAMES, statsData } from '../lib/analytics'
import { parseKey, useStore } from '../lib/store'
import { useUI } from '../lib/uiContext'
import { Amount, Card } from '../components/ui'
import { AreaChart, Donut, segmentShade } from '../components/viz'

const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function Kpi({ label, children, delay }: { label: string; children: ReactNode; delay: number }) {
  return (
    <Card delay={delay}>
      <div className="mb-2 text-[9px] uppercase tracking-[.2em] text-faint">{label}</div>
      <div className="font-serif text-[30px] leading-none tracking-[-.01em] text-ink">{children}</div>
    </Card>
  )
}

export function StatsView() {
  const { data, fmt } = useStore()
  const { openDay } = useUI()
  const now = new Date()
  const [calYear, setCalYear] = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth())

  const s = useMemo(() => statsData(data, calYear, calMonth), [data, calYear, calMonth])
  const monthSum = s.catTotals.reduce((a, c) => a + c.amount, 0)
  const stripAmt = (n: number) => fmt(n).replace(/[€$£]/, '').replace(/\.\d+$/, '')

  const shiftMonth = (dir: number) => {
    let m = calMonth + dir
    let y = calYear
    if (m < 0) {
      m = 11
      y--
    } else if (m > 11) {
      m = 0
      y++
    }
    setCalMonth(m)
    setCalYear(y)
  }

  const levelBg = (lvl: number) =>
    lvl === 4
      ? 'var(--accent)'
      : lvl === 3
        ? 'color-mix(in srgb, var(--accent) 62%, var(--line))'
        : lvl === 2
          ? 'color-mix(in srgb, var(--accent) 36%, var(--line))'
          : lvl === 1
            ? 'color-mix(in srgb, var(--accent) 14%, var(--line))'
            : 'var(--line)'

  return (
    <div>
      {/* KPI bento */}
      <div className="mb-3 grid grid-cols-2 gap-3">
        <Kpi label="All-time" delay={0}>
          <Amount value={s.totalAll} className="font-serif" />
        </Kpi>
        <Kpi label="Entries" delay={0.04}>
          {s.countAll}
        </Kpi>
        <Kpi label="Avg / entry" delay={0.08}>
          <Amount value={s.avg} className="font-serif" />
        </Kpi>
        <Kpi label="Biggest day" delay={0.12}>
          <Amount value={s.biggestDay} className="font-serif" />
        </Kpi>
        <Kpi label="Active days" delay={0.16}>
          {s.activeDays}
        </Kpi>
        <Kpi label="No-spend days" delay={0.2}>
          {s.noSpend}
        </Kpi>
      </div>

      {/* 30-day area chart */}
      <Card className="mb-3" delay={0.06}>
        <div className="mb-3 text-[9px] uppercase tracking-[.22em] text-faint">Last 30 days</div>
        <AreaChart data={s.days.map((d) => d.total)} height={84} />
        <div className="mt-3 flex justify-between text-[9px] uppercase tracking-[.1em] text-faint">
          <span>30d ago</span>
          <span>Today</span>
        </div>
      </Card>

      {/* category donut */}
      <Card className="mb-3" delay={0.08}>
        <div className="mb-4 text-[9px] uppercase tracking-[.22em] text-faint">By category · this month</div>
        {s.catTotals.length === 0 ? (
          <div className="py-6 text-center font-serif text-[14px] italic text-faint">no entries this month</div>
        ) : (
          <div className="flex items-center gap-5">
            <Donut segments={s.catTotals.map((c) => ({ value: c.amount }))} size={120} thickness={15}>
              <div>
                <div className="font-serif text-[22px] leading-none text-ink">{stripAmt(monthSum)}</div>
                <div className="mt-1 text-[7.5px] uppercase tracking-[.14em] text-faint">this month</div>
              </div>
            </Donut>
            <div className="min-w-0 flex-1 space-y-2">
              {s.catTotals.slice(0, 6).map((c, i) => (
                <div key={c.cat} className="flex items-center gap-2 text-[11px]">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: segmentShade(i) }} />
                  <CatIcon id={c.cat} size={12} className="shrink-0 text-faint" />
                  <span className="truncate text-sub">{catLabel(c.cat)}</span>
                  <span className="ml-auto shrink-0 font-mono tabular-nums text-ink">{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* calendar heatmap */}
      <Card className="mb-3" delay={0.1}>
        <div className="mb-4 flex items-baseline justify-between">
          <div className="font-serif text-[20px] italic text-ink">
            {MONTH_NAMES[calMonth]} {calYear}
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => shiftMonth(-1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-faint hover:text-ink">
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => {
                setCalMonth(now.getMonth())
                setCalYear(now.getFullYear())
              }}
              className="rounded-full border border-line px-2.5 text-[9px] uppercase tracking-[.15em] text-faint hover:text-ink"
            >
              today
            </button>
            <button onClick={() => shiftMonth(1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-faint hover:text-ink">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
        <div className="mb-1.5 grid grid-cols-7 gap-1">
          {DOW.map((d, i) => (
            <div key={i} className="text-center text-[9px] uppercase tracking-[.08em] text-faint">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: s.calOffset }).map((_, i) => (
            <div key={`b${i}`} className="aspect-square" />
          ))}
          {s.calCells.map((c) => (
            <button
              key={c.key}
              onClick={() => openDay(c.key)}
              className="flex aspect-square flex-col items-center justify-center rounded-md text-[11px] transition-transform hover:scale-105"
              style={{
                background: levelBg(c.level),
                color: c.level >= 3 ? 'var(--accent-on)' : 'var(--sub)',
                border: c.isToday ? '1px solid var(--ink)' : '1px solid transparent',
              }}
              title={`${c.key}: ${fmt(c.total)}`}
            >
              <span>{c.day}</span>
              {c.total > 0 && <span className="mt-0.5 text-[8px] tabular-nums opacity-70">{stripAmt(c.total)}</span>}
            </button>
          ))}
        </div>
      </Card>

      {/* weekday */}
      <Card className="mb-3" delay={0.12}>
        <div className="mb-4 text-[9px] uppercase tracking-[.22em] text-faint">By weekday · avg</div>
        <div className="grid grid-cols-7 gap-1.5">
          {s.dowAvg.map((v, i) => (
            <div key={i} className="text-center">
              <div className="relative mb-2 h-[56px] overflow-hidden rounded-md bg-line">
                <motion.div
                  className="absolute inset-x-0 bottom-0"
                  style={{ background: 'linear-gradient(180deg, var(--accent), var(--accent-dim))' }}
                  initial={{ height: 0 }}
                  animate={{ height: `${(v / s.dowMax) * 100}%` }}
                  transition={{ duration: 1, ease: [0.2, 0.7, 0.2, 1] }}
                />
              </div>
              <div className="text-[9px] uppercase tracking-[.06em] text-faint">{DOW[i]}</div>
              <div className="mt-0.5 text-[10px] tabular-nums text-sub">{v > 0 ? stripAmt(v) : '—'}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* top expenses */}
      <Card delay={0.14}>
        <div className="mb-3 text-[9px] uppercase tracking-[.22em] text-faint">Top single expenses</div>
        {s.topExpenses.length === 0 ? (
          <div className="py-4 text-center font-serif text-[14px] italic text-faint">nothing yet</div>
        ) : (
          s.topExpenses.map(({ key, e }, i) => (
            <button
              key={key + i}
              onClick={() => openDay(key)}
              className="grid w-full grid-cols-[52px_1fr_auto] items-baseline gap-3 border-b border-line py-2.5 text-left last:border-0"
            >
              <span className="text-[11px] uppercase tracking-[.08em] text-faint">
                {parseKey(key).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5 text-[13px] text-sub">
                <CatIcon id={e.cat} size={13} className="shrink-0 text-faint" />
                <span className="truncate">{e.desc || catLabel(e.cat)}</span>
              </span>
              <span className="font-mono font-medium tabular-nums text-ink">{fmt(e.amount)}</span>
            </button>
          ))
        )}
      </Card>
    </div>
  )
}
