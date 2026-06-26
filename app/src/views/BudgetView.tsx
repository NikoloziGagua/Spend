import { motion } from 'framer-motion'
import { Repeat, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CATEGORIES, CatIcon, catById } from '../categories'
import { monthKey, useStore } from '../lib/store'
import type { CatId, Freq } from '../types'

function Bar({ pct, tone }: { pct: number; tone: 'accent' | 'warn' | 'over' }) {
  const color = tone === 'over' ? 'var(--danger)' : tone === 'warn' ? 'var(--warn)' : 'var(--accent)'
  return (
    <div className="h-[10px] overflow-hidden rounded-full bg-line">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(pct, 100)}%` }}
        transition={{ duration: 1, ease: [0.2, 0.7, 0.2, 1] }}
      />
    </div>
  )
}

export function BudgetView() {
  const { data, budgets, recurring, fmt, setOverallBudget, setCatBudget, addRecurring, deleteRecurring, showToast } =
    useStore()
  const [budgetInput, setBudgetInput] = useState('')

  const { monthSpent, catTotals } = useMemo(() => {
    const mk = monthKey()
    let ms = 0
    const ct: Record<string, number> = {}
    Object.keys(data).forEach((k) => {
      if (k.startsWith(mk))
        (data[k] || []).forEach((e) => {
          ms += e.amount
          ct[e.cat] = (ct[e.cat] || 0) + e.amount
        })
    })
    return { monthSpent: ms, catTotals: ct }
  }, [data])

  const overall = budgets.overall || 0
  const now = new Date()
  const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate()
  const left = overall - monthSpent
  const dailyLeft = daysLeft > 0 ? left / daysLeft : 0
  const tone: 'accent' | 'warn' | 'over' =
    monthSpent > overall ? 'over' : overall > 0 && monthSpent / overall > 0.8 ? 'warn' : 'accent'

  const setOverall = () => {
    const n = parseFloat(budgetInput.replace(',', '.'))
    if (!n || n < 0) return
    setOverallBudget(n)
    setBudgetInput('')
    showToast('Budget set')
  }

  const editCat = (id: CatId, label: string) => {
    const cur = budgets.byCat[id] || 0
    const v = window.prompt(`Set monthly limit for ${label} (blank to clear):`, cur ? String(cur) : '')
    if (v === null) return
    setCatBudget(id, v.trim() === '' ? 0 : parseFloat(v.replace(',', '.')) || 0)
    showToast('Limit updated')
  }

  return (
    <div>
      {/* overall */}
      <div className="mb-[30px] border-b border-line pb-6">
        <div className="mb-3.5 flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-[.2em] text-faint">Monthly budget</span>
          <span className="font-mono text-[13px] tabular-nums text-sub">
            {overall > 0 ? (
              <>
                <span className="text-[15px] font-semibold text-ink">{fmt(monthSpent)}</span>
                <span className="mx-1 text-faint">of</span>
                <span>{fmt(overall)}</span>
              </>
            ) : (
              <span className="text-faint">no budget set</span>
            )}
          </span>
        </div>
        <Bar pct={overall > 0 ? (monthSpent / overall) * 100 : 0} tone={tone} />
        {overall > 0 && (
          <div className="mt-2.5 flex justify-between text-[10px] tracking-[.04em] text-faint">
            {left < 0 ? (
              <span className="text-danger">{fmt(-left)} over</span>
            ) : (
              <span className="text-ink">{fmt(left)} left</span>
            )}
            <span>
              {left >= 0 ? `${fmt(dailyLeft)}/day for ` : ''}
              {daysLeft} day{daysLeft === 1 ? '' : 's'} left
            </span>
          </div>
        )}
        <div className="mt-4 flex items-center gap-2.5">
          <input
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value.replace(/[^\d.,]/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && setOverall()}
            inputMode="decimal"
            placeholder={overall > 0 ? 'change budget…' : 'set monthly budget…'}
            className="flex-1 border-b border-line bg-transparent py-2 font-mono text-[15px] text-ink outline-none focus:border-ink"
          />
          <button
            onClick={setOverall}
            className="rounded-full bg-accent px-[18px] py-2.5 font-mono text-[10px] font-bold uppercase tracking-[.14em] text-accentOn"
          >
            Set
          </button>
        </div>
      </div>

      {/* by category */}
      <div className="mb-[38px]">
        <div className="mb-[18px] font-mono text-[10px] uppercase tracking-[.2em] text-faint">By category</div>
        {CATEGORIES.map((c, i) => {
          const spent = catTotals[c.id] || 0
          const lim = budgets.byCat[c.id] || 0
          const over = lim > 0 && spent > lim
          return (
            <div
              key={c.id}
              className={`flex items-center gap-3 py-3.5 ${i === 0 ? '' : 'border-t border-line'}`}
            >
              <div className="flex min-w-[84px] items-center gap-2 text-[11px] uppercase tracking-[.08em] text-sub">
                <CatIcon id={c.id} size={13} className="text-faint" />
                {c.label}
              </div>
              <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{
                    width: `${lim > 0 ? Math.min((spent / lim) * 100, 100) : 0}%`,
                    background: over ? 'var(--danger)' : 'var(--accent-dim)',
                  }}
                />
              </div>
              <div className="min-w-[96px] text-right font-mono text-[11px] tabular-nums text-sub">
                {fmt(spent)}
                {lim > 0 ? ` / ${fmt(lim)}` : ''}
              </div>
              <button
                onClick={() => editCat(c.id, c.label)}
                className="rounded-full border border-line px-2.5 py-1 font-mono text-[9px] uppercase tracking-[.1em] text-faint transition-colors hover:border-faint hover:text-ink"
              >
                {lim > 0 ? 'edit' : 'set'}
              </button>
            </div>
          )
        })}
      </div>

      {/* recurring */}
      <RecurringSection
        recurring={recurring}
        fmt={fmt}
        onAdd={addRecurring}
        onDelete={(id, desc) => {
          if (window.confirm(`Remove "${desc}" from recurring?`)) {
            deleteRecurring(id)
            showToast('Recurring removed')
          }
        }}
      />
    </div>
  )
}

function RecurringSection({
  recurring,
  fmt,
  onAdd,
  onDelete,
}: {
  recurring: ReturnType<typeof useStore>['recurring']
  fmt: (n: number) => string
  onAdd: ReturnType<typeof useStore>['addRecurring']
  onDelete: (id: string, desc: string) => void
}) {
  const [desc, setDesc] = useState('')
  const [amt, setAmt] = useState('')
  const [cat, setCat] = useState<CatId>('bills')
  const [freq, setFreq] = useState<Freq>('monthly')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))

  const add = () => {
    const n = parseFloat(amt.replace(',', '.'))
    if (!desc.trim() || !n || n <= 0) return
    onAdd({ desc: desc.trim(), cat, amount: n, freq, startDate: date })
    setDesc('')
    setAmt('')
  }

  return (
    <div className="mb-[38px]">
      <div className="mb-3.5 font-mono text-[10px] uppercase tracking-[.2em] text-faint">Recurring</div>
      <p className="mb-3.5 font-serif text-[13px] italic leading-[1.5] text-faint">
        Subscriptions, rent, anything that comes back. Auto-logged on schedule.
      </p>

      {recurring.length === 0 ? (
        <div className="py-2 font-serif text-[13px] italic text-faint">No recurring expenses yet.</div>
      ) : (
        recurring.map((r) => (
          <div key={r.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-line py-3.5">
            <div>
              <div className="flex items-center gap-1.5 text-[14px] text-ink">
                <CatIcon id={r.cat} size={13} className="text-faint" />
                {r.desc}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[10px] uppercase tracking-[.06em] text-faint">
                <Repeat size={10} /> {r.freq} · next {r.nextDate || '—'}
              </div>
            </div>
            <div className="font-mono text-[14px] font-semibold tabular-nums text-ink">{fmt(r.amount)}</div>
            <button onClick={() => onDelete(r.id, r.desc)} className="p-1 text-faint hover:text-danger">
              <X size={16} />
            </button>
          </div>
        ))
      )}

      <div className="mt-4 rounded-tile glass p-4">
        <div className="mb-3 flex gap-4">
          <div className="min-w-0 flex-1">
            <label className="mb-1.5 block text-[9px] uppercase tracking-[.18em] text-faint">Description</label>
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="e.g. Netflix"
              className="w-full border-b border-line bg-transparent py-2 font-mono text-[15px] text-ink outline-none focus:border-ink"
            />
          </div>
          <div className="w-[100px]">
            <label className="mb-1.5 block text-[9px] uppercase tracking-[.18em] text-faint">Amount</label>
            <input
              value={amt}
              onChange={(e) => setAmt(e.target.value.replace(/[^\d.,]/g, ''))}
              inputMode="decimal"
              placeholder="0.00"
              className="w-full border-b border-line bg-transparent py-2 text-right font-mono text-[18px] font-medium text-ink outline-none focus:border-ink"
            />
          </div>
        </div>
        <div className="mb-3 flex gap-4">
          <div className="flex-1">
            <label className="mb-1.5 block text-[9px] uppercase tracking-[.18em] text-faint">Category</label>
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value as CatId)}
              className="w-full border-b border-line bg-transparent py-2 font-mono text-[14px] text-ink outline-none focus:border-ink"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block text-[9px] uppercase tracking-[.18em] text-faint">Frequency</label>
            <select
              value={freq}
              onChange={(e) => setFreq(e.target.value as Freq)}
              className="w-full border-b border-line bg-transparent py-2 font-mono text-[14px] text-ink outline-none focus:border-ink"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-[9px] uppercase tracking-[.18em] text-faint">First charge date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border-b border-line bg-transparent py-2 font-mono text-[14px] text-ink outline-none focus:border-ink"
          />
        </div>
        <button
          onClick={add}
          className="w-full rounded-full bg-accent py-3 font-mono text-[11px] font-bold uppercase tracking-[.2em] text-accentOn"
        >
          Add recurring →
        </button>
      </div>
    </div>
  )
}
