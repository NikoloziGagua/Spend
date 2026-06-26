import NumberFlow from '@number-flow/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'
import { AddForm } from '../components/AddForm'
import { TxnRow } from '../components/TxnRow'
import { Amount, Card, RichText } from '../components/ui'
import { AreaChart, ProgressRing } from '../components/viz'
import { buildInsights, monthSummary } from '../lib/analytics'
import { dateKey, todayKey, useStore } from '../lib/store'

export function TodayView() {
  const { data, budgets, settings, fmt } = useStore()
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

  const dateStr = new Date()
    .toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
    .toUpperCase()

  // ring: budget used this month, or today vs daily average as a fallback
  const hasBudget = budgets.overall > 0
  const ringPct = hasBudget ? (ms.total / budgets.overall) * 100 : ms.avg > 0 ? (todayTotal / ms.avg) * 100 : 0
  const over = hasBudget && ms.total > budgets.overall

  return (
    <div>
      {/* focal hero card */}
      <Card className="relative mb-5 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full"
          style={{ background: 'radial-gradient(closest-side, var(--accent-soft), transparent)' }}
        />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[.18em] text-faint">
              Spent today <span className="mx-0.5 opacity-50">·</span> {dateStr}
            </div>
            <Amount
              value={todayTotal}
              className="mt-1.5 block font-serif leading-[.9] tracking-[-.02em] text-ink"
              style={{ fontSize: 'clamp(40px, 13vw, 60px)' }}
            />
            <div className="mt-2 font-serif text-[14px] italic text-faint">
              {fmt(ms.total)} this month · {ms.count} {ms.count === 1 ? 'entry' : 'entries'}
            </div>
          </div>
          <ProgressRing value={ringPct / 100} size={92} stroke={9} color={over ? 'var(--danger)' : 'var(--accent)'}>
            <div>
              <div className="font-mono text-[19px] font-semibold tabular-nums text-ink">
                <NumberFlow value={Math.round(ringPct)} />%
              </div>
              <div className="mt-0.5 text-[7.5px] uppercase tracking-[.14em] text-faint">
                {hasBudget ? 'of budget' : 'vs avg'}
              </div>
            </div>
          </ProgressRing>
        </div>
        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-[9px] uppercase tracking-[.16em] text-faint">
            <span>Last 7 days</span>
            <span className="tabular-nums">{fmt(last7sum)}</span>
          </div>
          <AreaChart data={last7} height={48} />
        </div>
      </Card>

      {/* insights */}
      {insights.map((ins, i) => (
        <motion.div
          key={ins.text}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="mb-[22px] border-l-2 py-1 pl-4 font-serif text-[17px] italic leading-[1.5] text-sub"
          style={{
            borderColor:
              ins.type === 'danger' ? 'var(--danger)' : ins.type === 'warn' ? 'var(--warn)' : 'var(--line-strong)',
          }}
        >
          <RichText text={ins.text} />
        </motion.div>
      ))}

      <AddForm />

      {/* today's transactions */}
      <div className="mb-8">
        <div className="mb-1.5 flex items-baseline justify-between pb-3.5">
          <div className="font-mono text-[10px] uppercase tracking-[.2em] text-faint">Today&rsquo;s receipt</div>
          <div className="text-[9px] uppercase tracking-[.14em] text-faint">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </div>
        </div>
        {items.length === 0 ? (
          <div className="py-10 text-center font-serif text-[16px] italic text-faint">— nothing recorded yet —</div>
        ) : (
          <AnimatePresence initial={false}>
            {items.map((item, i) => (
              <TxnRow key={item.id} item={item} dateKey={today} index={i} />
            ))}
          </AnimatePresence>
        )}
        {items.length > 0 && (
          <div className="mt-2 flex items-center justify-between pt-3 text-[11px] uppercase tracking-[.18em] text-faint">
            <span>Total</span>
            <Amount value={todayTotal} className="font-serif text-[34px] tracking-[-.02em] text-ink" />
          </div>
        )}
      </div>

      {/* month bento */}
      <div className="mb-7 grid grid-cols-2 gap-3">
        <Card className="col-span-2" delay={0.04}>
          <div className="mb-2 text-[9px] uppercase tracking-[.2em] text-faint">This month</div>
          <Amount value={ms.total} className="font-serif text-[44px] leading-none tracking-[-.02em] text-ink" />
          <div className="mt-2 font-serif text-[14px] italic text-faint">
            {ms.count === 0
              ? `${ms.monthName} — no entries yet`
              : `${ms.monthName} — ${ms.activeDays} active day${ms.activeDays === 1 ? '' : 's'}`}
          </div>
        </Card>
        <Card delay={0.08}>
          <div className="mb-2 text-[9px] uppercase tracking-[.2em] text-faint">Daily avg</div>
          <Amount value={ms.avg} className="font-serif text-[30px] leading-none text-ink" />
        </Card>
        <Card delay={0.12}>
          <div className="mb-2 text-[9px] uppercase tracking-[.2em] text-faint">Entries</div>
          <div className="font-serif text-[30px] leading-none text-ink">{ms.count}</div>
        </Card>
      </div>
    </div>
  )
}
