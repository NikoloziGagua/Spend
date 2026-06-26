import NumberFlow from '@number-flow/react'
import { Repeat, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CATEGORIES, CatIcon } from '../categories'
import { monthKey, useStore } from '../lib/store'
import type { CatId, Freq } from '../types'
import { Card } from '../components/ui'
import { ProgressRing } from '../components/viz'

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
  const usedPct = overall > 0 ? (monthSpent / overall) * 100 : 0
  const tone = monthSpent > overall ? 'var(--danger)' : overall > 0 && usedPct > 80 ? 'var(--warn)' : 'var(--accent)'

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
      {/* overall budget ring */}
      <Card className="mb-5">
        <div className="flex items-center gap-5">
          <ProgressRing value={usedPct / 100} size={104} stroke={10} color={tone}>
            {overall > 0 ? (
              <div>
                <div className="font-mono text-[20px] font-semibold tabular-nums text-ink">
                  <NumberFlow value={Math.round(usedPct)} />%
                </div>
                <div className="mt-0.5 text-[7.5px] uppercase tracking-[.14em] text-faint">used</div>
              </div>
            ) : (
              <div className="px-3 text-center text-[9px] uppercase leading-tight tracking-[.12em] text-faint">no budget</div>
            )}
          </ProgressRing>
          <div className="min-w-0 flex-1">
            <div className="mb-1 text-[10px] uppercase tracking-[.2em] text-faint">Monthly budget</div>
            {overall > 0 ? (
              <>
                <div className="font-serif text-[30px] leading-none text-ink">{fmt(monthSpent)}</div>
                <div className="mt-1 font-serif text-[14px] italic text-faint">of {fmt(overall)}</div>
                <div className="mt-2.5 text-[11px] tracking-[.02em]" style={{ color: left < 0 ? 'var(--danger)' : 'var(--sub)' }}>
                  {left < 0 ? `${fmt(-left)} over` : `${fmt(left)} left`}
                  <span className="text-faint"> · {fmt(Math.max(0, dailyLeft))}/day · {daysLeft}d</span>
                </div>
              </>
            ) : (
              <div className="font-serif text-[15px] italic leading-snug text-faint">
                Set a monthly budget to track your pace.
              </div>
            )}
          </div>
        </div>
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
      </Card>

      {/* by category */}
      <Card className="mb-5" delay={0.06}>
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[.2em] text-faint">By category</div>
        {CATEGORIES.map((c, i) => {
          const spent = catTotals[c.id] || 0
          const lim = budgets.byCat[c.id] || 0
          const over = lim > 0 && spent > lim
          return (
            <div key={c.id} className={`flex items-center gap-3 py-3 ${i === 0 ? '' : 'border-t border-line'}`}>
              <div className="flex min-w-[80px] items-center gap-2 text-[11px] uppercase tracking-[.08em] text-sub">
                <CatIcon id={c.id} size={13} className="text-faint" />
                {c.label}
              </div>
              <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{
                    width: `${lim > 0 ? Math.min((spent / lim) * 100, 100) : 0}%`,
                    background: over ? 'var(--danger)' : 'linear-gradient(90deg, var(--accent-dim), var(--accent))',
                  }}
                />
              </div>
              <div className="min-w-[92px] text-right font-mono text-[11px] tabular-nums text-sub">
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
      </Card>

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
    <Card className="mb-7" delay={0.1}>
      <div className="mb-2 font-mono text-[10px] uppercase tracking-[.2em] text-faint">Recurring</div>
      <p className="mb-3.5 font-serif text-[13px] italic leading-[1.5] text-faint">
        Subscriptions, rent, anything that comes back. Auto-logged on schedule.
      </p>

      {recurring.length === 0 ? (
        <div className="py-1 font-serif text-[13px] italic text-faint">No recurring expenses yet.</div>
      ) : (
        recurring.map((r) => (
          <div key={r.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-line py-3 last:border-0">
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

      <div className="mt-4 border-t border-line pt-4">
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
    </Card>
  )
}
