import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { CatIcon, catLabel } from '../categories'
import { MONTH_NAMES, statsData } from '../lib/analytics'
import { parseKey, useStore } from '../lib/store'
import { useUI } from '../lib/uiContext'
import { Amount } from '../components/ui'

const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function Kpi({ label, children, border }: { label: string; children: ReactNode; border?: boolean }) {
  return (
    <div className={`border-b border-line py-[18px] ${border ? 'border-l border-line pl-[18px]' : 'pr-[18px]'}`}>
      <div className="mb-3 text-[9px] uppercase tracking-[.2em] text-faint">{label}</div>
      <div className="font-serif text-[34px] leading-none tracking-[-.01em] text-ink">{children}</div>
    </div>
  )
}

function StatBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-9">
      <div className="mb-[18px] text-[9px] uppercase tracking-[.22em] text-faint">{label}</div>
      {children}
    </div>
  )
}

export function StatsView() {
  const { data, fmt } = useStore()
  const { openDay } = useUI()
  const now = new Date()
  const [calYear, setCalYear] = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth())

  const s = useMemo(() => statsData(data, calYear, calMonth), [data, calYear, calMonth])

  const stripAmt = (n: number) => fmt(n).replace(/[€$£]/, '').replace(/\.\d+$/, '')

  const prevMonth = () => {
    let m = calMonth - 1
    let y = calYear
    if (m < 0) {
      m = 11
      y--
    }
    setCalMonth(m)
    setCalYear(y)
  }
  const nextMonth = () => {
    let m = calMonth + 1
    let y = calYear
    if (m > 11) {
      m = 0
      y++
    }
    setCalMonth(m)
    setCalYear(y)
  }
  const calToday = () => {
    setCalMonth(now.getMonth())
    setCalYear(now.getFullYear())
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
      {/* KPI grid */}
      <div className="mb-[30px] grid grid-cols-2 border-t border-line">
        <Kpi label="All-time">
          <Amount value={s.totalAll} className="font-serif" />
        </Kpi>
        <Kpi label="Entries" border>
          {s.countAll}
        </Kpi>
        <Kpi label="Avg / entry">
          <Amount value={s.avg} className="font-serif" />
        </Kpi>
        <Kpi label="Biggest day" border>
          <Amount value={s.biggestDay} className="font-serif" />
        </Kpi>
        <Kpi label="Active days">{s.activeDays}</Kpi>
        <Kpi label="No-spend days" border>
          {s.noSpend}
        </Kpi>
      </div>

      {/* 30 day chart */}
      <StatBlock label="Last 30 days">
        <div className="flex h-[100px] items-end gap-[3px]">
          {s.days.map((d, i) => (
            <motion.button
              key={d.key}
              onClick={() => openDay(d.key)}
              className="min-h-[3px] flex-1 rounded-full"
              style={{ background: d.isToday ? 'var(--accent)' : d.hasSpending ? 'var(--accent-dim)' : 'var(--line)' }}
              initial={{ height: 0 }}
              animate={{ height: `${d.total > 0 ? Math.max(4, (d.total / s.dayMax) * 100) : 2}%` }}
              transition={{ delay: i * 0.012, type: 'spring', stiffness: 320, damping: 30 }}
              title={`${d.key}: ${fmt(d.total)}`}
            />
          ))}
        </div>
        <div className="mt-3 flex justify-between text-[9px] uppercase tracking-[.1em] text-faint">
          <span>30d ago</span>
          <span>Today</span>
        </div>
      </StatBlock>

      {/* calendar */}
      <StatBlock label="">
        <div className="mb-4 flex items-baseline justify-between">
          <div className="font-serif text-[20px] italic text-ink">
            {MONTH_NAMES[calMonth]} {calYear}
          </div>
          <div className="flex gap-1.5">
            <button onClick={prevMonth} className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-faint hover:text-ink">
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={calToday}
              className="rounded-full border border-line px-2.5 text-[9px] uppercase tracking-[.15em] text-faint hover:text-ink"
            >
              today
            </button>
            <button onClick={nextMonth} className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-faint hover:text-ink">
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
      </StatBlock>

      {/* weekday */}
      <StatBlock label="By weekday (avg)">
        <div className="grid grid-cols-7 gap-1.5">
          {s.dowAvg.map((v, i) => (
            <div key={i} className="text-center">
              <div className="relative mb-2 h-[56px] overflow-hidden rounded-md bg-line">
                <motion.div
                  className="absolute inset-x-0 bottom-0"
                  style={{ background: 'var(--accent-dim)' }}
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
      </StatBlock>

      {/* category bars */}
      <StatBlock label="By category (this month)">
        {s.catTotals.length === 0 ? (
          <div className="py-5 text-center font-serif text-[14px] italic text-faint">no entries this month</div>
        ) : (
          s.catTotals.map((c, i) => (
            <div key={c.cat} className="mb-[18px] last:mb-0">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="flex items-center gap-2 text-[11px] uppercase tracking-[.1em] text-sub">
                  <CatIcon id={c.cat} size={14} className="text-faint" />
                  {catLabel(c.cat)}
                </span>
                <span className="font-mono text-[14px] font-medium tabular-nums text-ink">
                  {fmt(c.amount)}
                  <span className="ml-1.5 text-[10px] font-normal text-faint">{c.pct}%</span>
                </span>
              </div>
              <div className="h-[3px] overflow-hidden rounded-full bg-line">
                <motion.div
                  className="h-full rounded-full bg-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${(c.amount / s.catMax) * 100}%` }}
                  transition={{ duration: 1, delay: i * 0.06, ease: [0.2, 0.7, 0.2, 1] }}
                />
              </div>
            </div>
          ))
        )}
      </StatBlock>

      {/* top expenses */}
      <StatBlock label="Top single expenses">
        {s.topExpenses.length === 0 ? (
          <div className="py-5 text-center font-serif text-[14px] italic text-faint">nothing yet</div>
        ) : (
          s.topExpenses.map(({ key, e }, i) => (
            <button
              key={key + i}
              onClick={() => openDay(key)}
              className="grid w-full grid-cols-[56px_1fr_auto] items-baseline gap-3.5 border-b border-line py-3 text-left last:border-0"
            >
              <span className="text-[11px] uppercase tracking-[.08em] text-faint">
                {parseKey(key).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5 text-[13px] text-sub">
                <CatIcon id={e.cat} size={13} className="text-faint" />
                {e.desc || catLabel(e.cat)}
              </span>
              <span className="font-mono font-medium tabular-nums text-ink">{fmt(e.amount)}</span>
            </button>
          ))
        )}
      </StatBlock>
    </div>
  )
}
