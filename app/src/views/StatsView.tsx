import { motion } from 'framer-motion'
import { CalendarCheck, ChevronLeft, ChevronRight, Flame, Hash, Moon, TrendingUp, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CatIcon, catLabel } from '../categories'
import { MONTH_NAMES, statsData } from '../lib/analytics'
import { dateKey, parseKey, useStore } from '../lib/store'
import { useUI } from '../lib/uiContext'
import { Amount, Card, Reveal, StatTile, ViewHeader } from '../components/ui'
import { AreaChart, Donut, segmentShade } from '../components/viz'

const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function StatsView() {
  const { data, fmt } = useStore()
  const { openDay } = useUI()
  const now = new Date()
  const [calYear, setCalYear] = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth())

  const s = useMemo(() => statsData(data, calYear, calMonth), [data, calYear, calMonth])
  const monthSum = s.catTotals.reduce((a, c) => a + c.amount, 0)
  const stripAmt = (n: number) => fmt(n).replace(/[€$£]/, '').replace(/\.\d+$/, '')

  // current week (Mon-first) daily totals
  const week = useMemo(() => {
    const dow = (now.getDay() + 6) % 7
    const monday = new Date(now)
    monday.setDate(now.getDate() - dow)
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const key = dateKey(d)
      return { key, total: (data[key] || []).reduce((a, e) => a + e.amount, 0), isToday: key === dateKey(now) }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])
  const weekTotal = week.reduce((a, w) => a + w.total, 0)
  const weekMax = Math.max(...week.map((w) => w.total), 1)

  const shiftMonth = (dir: number) => {
    let m = calMonth + dir
    let y = calYear
    if (m < 0) { m = 11; y-- } else if (m > 11) { m = 0; y++ }
    setCalMonth(m)
    setCalYear(y)
  }

  const levelBg = (lvl: number) =>
    lvl === 4 ? 'var(--accent)'
      : lvl === 3 ? 'color-mix(in srgb, var(--accent) 62%, var(--line))'
        : lvl === 2 ? 'color-mix(in srgb, var(--accent) 36%, var(--line))'
          : lvl === 1 ? 'color-mix(in srgb, var(--accent) 14%, var(--line))'
            : 'var(--line)'

  return (
    <div>
      <ViewHeader label="Overview" title="Stats" />

      {/* weekly spend bar card */}
      <Card className="mb-3">
        <div className="font-display text-[30px] font-extrabold leading-none tracking-[-.02em] text-ink">
          <Amount value={weekTotal} />
        </div>
        <div className="mt-1.5 text-[13px] font-medium text-faint">spent this week</div>
        <div className="mt-5 flex h-[110px] items-end gap-2">
          {week.map((w, i) => (
            <div key={w.key} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-1 items-end">
                <motion.button
                  onClick={() => openDay(w.key)}
                  className="w-full rounded-lg"
                  style={{ background: w.isToday ? 'var(--accent)' : w.total > 0 ? 'var(--accent-dim)' : 'var(--line)' }}
                  initial={{ height: 0 }}
                  animate={{ height: `${w.total > 0 ? Math.max(8, (w.total / weekMax) * 100) : 6}%` }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 26 }}
                  title={fmt(w.total)}
                />
              </div>
              <span className="text-[10px] font-semibold uppercase text-faint">{DOW[i]}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* KPI tiles */}
      <div className="mb-3 grid grid-cols-2 gap-3">
        <StatTile icon={Wallet} label="All-time" delay={0}>
          <Amount value={s.totalAll} />
        </StatTile>
        <StatTile icon={Hash} label="Entries" delay={0.04}>
          {s.countAll}
        </StatTile>
        <StatTile icon={TrendingUp} label="Avg / entry" delay={0.08}>
          <Amount value={s.avg} />
        </StatTile>
        <StatTile icon={Flame} label="Biggest day" delay={0.12} tone="danger">
          <Amount value={s.biggestDay} />
        </StatTile>
        <StatTile icon={CalendarCheck} label="Active days" delay={0.16} tone="ok">
          {s.activeDays}
        </StatTile>
        <StatTile icon={Moon} label="No-spend days" delay={0.2}>
          {s.noSpend}
        </StatTile>
      </div>

      {/* trend area */}
      <Reveal className="mb-3">
        <Card>
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[.14em] text-faint">Last 30 days</div>
          <AreaChart data={s.days.map((d) => d.total)} height={84} />
          <div className="mt-3 flex justify-between text-[10px] font-semibold uppercase tracking-[.08em] text-faint">
            <span>30d ago</span>
            <span>Today</span>
          </div>
        </Card>
      </Reveal>

      {/* category donut */}
      <Reveal className="mb-3">
        <Card>
          <div className="mb-4 text-[11px] font-bold uppercase tracking-[.14em] text-faint">By category · this month</div>
          {s.catTotals.length === 0 ? (
            <div className="py-6 text-center font-serif text-[14px] italic text-faint">no entries this month</div>
          ) : (
            <div className="flex items-center gap-5">
              <Donut segments={s.catTotals.map((c) => ({ value: c.amount }))} size={118} thickness={15}>
                <div>
                  <div className="font-display text-[22px] font-extrabold leading-none text-ink">{stripAmt(monthSum)}</div>
                  <div className="mt-1 text-[7.5px] font-bold uppercase tracking-[.12em] text-faint">this month</div>
                </div>
              </Donut>
              <div className="min-w-0 flex-1 space-y-2.5">
                {s.catTotals.slice(0, 6).map((c, i) => (
                  <div key={c.cat} className="flex items-center gap-2 text-[12px]">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: segmentShade(i) }} />
                    <span className="truncate font-medium text-sub">{catLabel(c.cat)}</span>
                    <span className="ml-auto shrink-0 font-display font-bold tabular-nums text-ink">{c.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </Reveal>

      {/* calendar */}
      <Reveal className="mb-3">
        <Card>
          <div className="mb-4 flex items-baseline justify-between">
            <div className="font-display text-[18px] font-extrabold text-ink">
              {MONTH_NAMES[calMonth]} {calYear}
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => shiftMonth(-1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-faint hover:text-ink">
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => { setCalMonth(now.getMonth()); setCalYear(now.getFullYear()) }}
                className="rounded-full border border-line px-2.5 text-[9px] font-semibold uppercase tracking-[.12em] text-faint hover:text-ink"
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
              <div key={i} className="text-center text-[9px] font-semibold uppercase text-faint">{d}</div>
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
                className="flex aspect-square flex-col items-center justify-center rounded-lg text-[11px] font-semibold transition-transform hover:scale-105"
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
      </Reveal>

      {/* weekday */}
      <Reveal className="mb-3">
        <Card>
          <div className="mb-4 text-[11px] font-bold uppercase tracking-[.14em] text-faint">By weekday · avg</div>
          <div className="grid grid-cols-7 gap-1.5">
            {s.dowAvg.map((v, i) => (
              <div key={i} className="text-center">
                <div className="relative mb-2 h-[56px] overflow-hidden rounded-lg bg-line">
                  <motion.div
                    className="absolute inset-x-0 bottom-0"
                    style={{ background: 'linear-gradient(180deg, var(--accent), var(--accent-dim))' }}
                    initial={{ height: 0 }}
                    animate={{ height: `${(v / s.dowMax) * 100}%` }}
                    transition={{ duration: 1, ease: [0.2, 0.7, 0.2, 1] }}
                  />
                </div>
                <div className="text-[9px] font-semibold uppercase text-faint">{DOW[i]}</div>
                <div className="mt-0.5 text-[10px] tabular-nums text-sub">{v > 0 ? stripAmt(v) : '—'}</div>
              </div>
            ))}
          </div>
        </Card>
      </Reveal>

      {/* top expenses */}
      <Reveal className="mb-3">
        <Card>
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[.14em] text-faint">Top single expenses</div>
          {s.topExpenses.length === 0 ? (
            <div className="py-4 text-center font-serif text-[14px] italic text-faint">nothing yet</div>
          ) : (
            s.topExpenses.map(({ key, e }, i) => (
              <button
                key={key + i}
                onClick={() => openDay(key)}
                className="grid w-full grid-cols-[52px_1fr_auto] items-baseline gap-3 border-b border-line py-2.5 text-left last:border-0"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[.06em] text-faint">
                  {parseKey(key).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                <span className="flex items-center gap-1.5 text-[13px] text-sub">
                  <CatIcon id={e.cat} size={13} className="shrink-0 text-faint" />
                  <span className="truncate">{e.desc || catLabel(e.cat)}</span>
                </span>
                <span className="font-display font-bold tabular-nums text-ink">{fmt(e.amount)}</span>
              </button>
            ))
          )}
        </Card>
      </Reveal>
    </div>
  )
}
