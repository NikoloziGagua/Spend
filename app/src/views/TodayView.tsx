import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'
import { AddForm } from '../components/AddForm'
import { TxnRow } from '../components/TxnRow'
import { Amount, RichText } from '../components/ui'
import { buildInsights, monthSummary } from '../lib/analytics'
import { todayKey, useStore } from '../lib/store'

export function TodayView() {
  const { data, budgets, settings, fmt } = useStore()
  const today = todayKey()
  const items = data[today] || []
  const insights = useMemo(
    () => buildInsights(data, budgets, settings, fmt),
    [data, budgets, settings, fmt]
  )
  const ms = useMemo(() => monthSummary(data), [data])
  const todayTotal = items.reduce((s, e) => s + e.amount, 0)

  return (
    <div>
      {/* insights */}
      <div>
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
      </div>

      <AddForm />

      {/* today's transactions */}
      <div className="mb-9">
        <div className="mb-1.5 flex items-baseline justify-between pb-3.5">
          <div className="font-mono text-[10px] uppercase tracking-[.2em] text-faint">Today&rsquo;s receipt</div>
          <div className="text-[9px] uppercase tracking-[.14em] text-faint">{items.length} items</div>
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

      {/* month summary */}
      <div className="mb-[30px] grid grid-cols-2 border-t border-line">
        <div className="col-span-2 border-b border-line py-5">
          <div className="mb-3 text-[9px] uppercase tracking-[.2em] text-faint">This month</div>
          <Amount value={ms.total} className="font-serif text-[46px] leading-none tracking-[-.02em] text-ink" />
          <div className="mt-2 font-serif text-[14px] italic text-faint">
            {ms.count === 0
              ? `${ms.monthName} — no entries yet`
              : `${ms.monthName} — ${ms.activeDays} active day${ms.activeDays === 1 ? '' : 's'}`}
          </div>
        </div>
        <div className="border-b border-line py-[18px] pr-[18px]">
          <div className="mb-3 text-[9px] uppercase tracking-[.2em] text-faint">Daily avg</div>
          <Amount value={ms.avg} className="font-serif text-[34px] leading-none tracking-[-.01em] text-ink" />
        </div>
        <div className="border-b border-l border-line py-[18px] pl-[18px]">
          <div className="mb-3 text-[9px] uppercase tracking-[.2em] text-faint">Entries</div>
          <div className="font-serif text-[34px] leading-none text-ink">{ms.count}</div>
        </div>
      </div>
    </div>
  )
}
