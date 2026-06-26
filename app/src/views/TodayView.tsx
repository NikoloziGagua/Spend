import NumberFlow from '@number-flow/react'
import { AnimatePresence, motion } from 'framer-motion'
import { TrendingUp, Wallet } from 'lucide-react'
import { useMemo } from 'react'
import { AddForm } from '../components/AddForm'
import { TxnRow } from '../components/TxnRow'
import { Amount, Card, DarkCard, Reveal, RichText, StatTile, ViewHeader } from '../components/ui'
import { ProgressRing, SegmentedBar, WeekStrip, type WeekCell } from '../components/viz'
import { CatIcon, catLabel } from '../categories'
import { buildInsights, monthSummary } from '../lib/analytics'
import { dateKey, monthKey, todayKey, useStore } from '../lib/store'
import { useUI } from '../lib/uiContext'

export function TodayView() {
  const { data, budgets, settings, fmt } = useStore()
  const { openDay } = useUI()
  const today = todayKey()
  const items = data[today] || []
  const todayTotal = items.reduce((s, e) => s + e.amount, 0)

  const insights = useMemo(() => buildInsights(data, budgets, settings, fmt), [data, budgets, settings, fmt])
  const ms = useMemo(() => monthSummary(data), [data])

  const last7 = useMemo(() => {
    const out: number[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      out.push((data[dateKey(d)] || []).reduce((s, e) => s + e.amount, 0))
    }
    return out
  }, [data])
  const last7sum = last7.reduce((s, n) => s + n, 0)
  const daysWithSpend = last7.filter((n) => n > 0).length

  const weekCells: WeekCell[] = useMemo(() => {
    const now = new Date()
    const dow = (now.getDay() + 6) % 7
    const monday = new Date(now)
    monday.setDate(now.getDate() - dow)
    const wd = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const key = dateKey(d)
      return { key, wd: wd[i], d: d.getDate(), total: (data[key] || []).reduce((s, e) => s + e.amount, 0), isToday: key === today }
    })
  }, [data, today])

  const topCat = useMemo(() => {
    const mk = monthKey()
    const ct: Record<string, number> = {}
    Object.keys(data).forEach((k) => {
      if (k.startsWith(mk)) (data[k] || []).forEach((e) => (ct[e.cat] = (ct[e.cat] || 0) + e.amount))
    })
    const top = Object.entries(ct).sort((a, b) => b[1] - a[1])[0]
    return top ? { cat: top[0], amount: top[1] } : null
  }, [data])
  const biggestToday = items.length ? items.reduce((a, b) => (b.amount > a.amount ? b : a), items[0]) : null

  const hour = new Date().getHours()
  const greeting = `Good ${hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'}`
  const hasBudget = budgets.overall > 0
  const ringPct = hasBudget ? (ms.total / budgets.overall) * 100 : ms.avg > 0 ? (todayTotal / ms.avg) * 100 : 0
  const over = hasBudget && ms.total > budgets.overall

  const focal = biggestToday
    ? { label: 'Biggest today', title: biggestToday.desc || catLabel(biggestToday.cat), sub: catLabel(biggestToday.cat), amount: biggestToday.amount, cat: biggestToday.cat }
    : topCat
      ? { label: 'Top category · this month', title: catLabel(topCat.cat), sub: 'most of your spending', amount: topCat.amount, cat: topCat.cat }
      : null

  return (
    <div>
      <ViewHeader label={greeting} title="Today" />

      {/* focal hero */}
      <Card className="relative mb-3 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full"
          style={{ background: 'radial-gradient(closest-side, var(--accent-soft), transparent)' }}
        />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-[.14em] text-faint">Spent today</div>
            <Amount
              value={todayTotal}
              className="mt-1.5 block font-display font-extrabold leading-none tracking-[-.03em] text-ink"
              style={{ fontSize: 'clamp(36px, 12vw, 54px)' }}
            />
            <div className="mt-2 text-[13px] font-medium text-faint">
              {fmt(ms.total)} this month · {ms.count} {ms.count === 1 ? 'entry' : 'entries'}
            </div>
          </div>
          <ProgressRing value={ringPct / 100} size={88} stroke={9} color={over ? 'var(--danger)' : 'var(--accent)'}>
            <div>
              <div className="font-display text-[18px] font-extrabold tabular-nums text-ink">
                <NumberFlow value={Math.round(ringPct)} />%
              </div>
              <div className="mt-0.5 text-[7.5px] font-bold uppercase tracking-[.12em] text-faint">
                {hasBudget ? 'of budget' : 'vs avg'}
              </div>
            </div>
          </ProgressRing>
        </div>
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[.12em] text-faint">
            <span>Last 7 days</span>
            <span className="tabular-nums">{fmt(last7sum)}</span>
          </div>
          <SegmentedBar filled={daysWithSpend} total={7} />
        </div>
      </Card>

      {/* stat tiles */}
      <div className="mb-3 grid grid-cols-2 gap-3">
        <StatTile icon={Wallet} label="This month" delay={0.04}>
          <Amount value={ms.total} />
        </StatTile>
        <StatTile icon={TrendingUp} label="Daily avg" delay={0.08}>
          <Amount value={ms.avg} />
        </StatTile>
      </div>

      {/* dark focal card */}
      {focal && (
        <DarkCard className="mb-3" delay={0.06}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[.14em]" style={{ opacity: 0.55 }}>
              {focal.label}
            </span>
          </div>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <div className="truncate font-display text-[24px] font-extrabold leading-tight">{focal.title}</div>
              <div className="mt-1 text-[14px]" style={{ opacity: 0.6 }}>
                {focal.sub} · {fmt(focal.amount)}
              </div>
            </div>
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
              style={{ background: 'var(--bg)', color: 'var(--ink)' }}
            >
              <CatIcon id={focal.cat} size={22} strokeWidth={2} />
            </div>
          </div>
        </DarkCard>
      )}

      {/* week strip */}
      <Reveal className="mb-3">
        <Card>
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[.14em] text-faint">This week</div>
          <WeekStrip cells={weekCells} onPick={openDay} />
        </Card>
      </Reveal>

      {/* insights */}
      {insights.map((ins, i) => (
        <motion.div
          key={ins.text}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="mb-3 border-l-2 py-1 pl-4 font-serif text-[17px] italic leading-[1.5] text-sub"
          style={{ borderColor: ins.type === 'danger' ? 'var(--danger)' : ins.type === 'warn' ? 'var(--warn)' : 'var(--line-strong)' }}
        >
          <RichText text={ins.text} />
        </motion.div>
      ))}

      {/* add expense */}
      <Reveal className="mb-3">
        <Card>
          <AddForm />
        </Card>
      </Reveal>

      {/* today list */}
      <Reveal className="mb-3">
        <div
          className="overflow-hidden rounded-tile"
          style={{ background: 'var(--card)', boxShadow: 'var(--shadow-tile)', border: '1px solid var(--line)' }}
        >
          <div className="flex items-baseline justify-between px-4 pb-1 pt-4">
            <div className="font-display text-[13px] font-bold uppercase tracking-[.1em] text-faint">Today&rsquo;s receipt</div>
            <div className="text-[11px] font-medium text-faint">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </div>
          </div>
          {items.length === 0 ? (
            <div className="px-4 py-10 text-center font-serif text-[16px] italic text-faint">— nothing recorded yet —</div>
          ) : (
            <div className="px-4">
              <AnimatePresence initial={false}>
                {items.map((item, i) => (
                  <TxnRow key={item.id} item={item} dateKey={today} index={i} />
                ))}
              </AnimatePresence>
            </div>
          )}
          {items.length > 0 && (
            <div className="flex items-center justify-between px-4 pb-4 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-[.16em] text-faint">Total</span>
              <Amount value={todayTotal} className="font-display text-[28px] font-extrabold tracking-[-.02em] text-ink" />
            </div>
          )}
        </div>
      </Reveal>
    </div>
  )
}
