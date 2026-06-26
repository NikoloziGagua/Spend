import { useState } from 'react'
import { CATEGORIES } from '../categories'
import { parseKey, todayKey, useStore } from '../lib/store'
import { useUI } from '../lib/uiContext'
import type { CatId, Expense } from '../types'
import { Sheet } from './ui'
import { TxnRow } from './TxnRow'

/* ---------------- Edit expense sheet ---------------- */
function EditForm({ item, dateKey, onDone }: { item: Expense; dateKey: string; onDone: () => void }) {
  const { updateExpense } = useStore()
  const [desc, setDesc] = useState(item.desc)
  const [amt, setAmt] = useState(item.amount.toFixed(2))
  const [cat, setCat] = useState<CatId>(item.cat)
  const [note, setNote] = useState(item.note || '')

  const save = () => {
    const n = parseFloat(amt.replace(',', '.'))
    if (!n || n <= 0) return
    updateExpense(dateKey, item.id, { desc: desc.trim(), amount: n, cat, note: note.trim() })
    onDone()
  }

  return (
    <div className="glass rounded-[28px] p-[26px_22px]">
      <h3 className="mb-5 font-serif text-[26px] italic text-ink">Edit expense</h3>

      <div className="mb-3 flex items-end gap-4">
        <div className="min-w-0 flex-1">
          <label className="mb-1.5 block text-[9px] uppercase tracking-[.18em] text-faint">Description</label>
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full border-b border-line bg-transparent py-2 font-mono text-[16px] text-ink outline-none focus:border-ink"
          />
        </div>
        <div className="w-[110px]">
          <label className="mb-1.5 block text-[9px] uppercase tracking-[.18em] text-faint">Amount</label>
          <input
            value={amt}
            onChange={(e) => setAmt(e.target.value.replace(/[^\d.,]/g, ''))}
            inputMode="decimal"
            className="w-full border-b border-line bg-transparent py-2 text-right font-mono text-[22px] font-medium text-ink outline-none focus:border-ink"
          />
        </div>
      </div>

      <label className="mb-2 mt-3 block text-[9px] uppercase tracking-[.18em] text-faint">Category</label>
      <div className="mb-3 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const active = c.id === cat
          return (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[.08em] transition-colors"
              style={{
                borderColor: active ? 'var(--accent)' : 'var(--line)',
                background: active ? 'var(--accent)' : 'transparent',
                color: active ? 'var(--accent-on)' : 'var(--sub)',
              }}
            >
              <c.Icon size={13} strokeWidth={1.6} />
              {c.label}
            </button>
          )
        })}
      </div>

      <label className="mb-2 block text-[9px] uppercase tracking-[.18em] text-faint">Note (optional)</label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="any extra detail…"
        className="min-h-[54px] w-full resize-y border-b border-line bg-transparent py-2 font-serif text-[15px] italic text-ink outline-none focus:border-ink"
      />

      <div className="mt-[18px] flex gap-2.5">
        <button
          onClick={onDone}
          className="flex-1 rounded-[14px] border border-line py-[14px] font-mono text-[11px] font-medium uppercase tracking-[.15em] text-sub"
        >
          Cancel
        </button>
        <button
          onClick={save}
          className="flex-1 rounded-[14px] bg-accent py-[14px] font-mono text-[11px] font-bold uppercase tracking-[.15em] text-accentOn"
        >
          Save
        </button>
      </div>
    </div>
  )
}

export function EditSheet() {
  const { edit, closeEdit } = useUI()
  return (
    <Sheet open={!!edit} onClose={closeEdit}>
      {edit && <EditForm key={edit.item.id} item={edit.item} dateKey={edit.dateKey} onDone={closeEdit} />}
    </Sheet>
  )
}

/* ---------------- Day receipt sheet ---------------- */
export function DaySheet() {
  const { dayKey, closeDay } = useUI()
  const { data, fmt } = useStore()
  const items = dayKey ? data[dayKey] || [] : []
  const total = items.reduce((s, e) => s + e.amount, 0)
  const dateLabel = dayKey
    ? parseKey(dayKey)
        .toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
        .toUpperCase()
    : ''

  return (
    <Sheet open={!!dayKey} onClose={closeDay}>
      <div className="glass rounded-[24px] px-[22px] py-6">
        <div className="mb-3 border-b border-line pb-3 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[.2em] text-faint">
            {dayKey === todayKey() ? "Today's receipt" : 'Receipt'}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[.14em] text-sub">{dateLabel}</div>
        </div>
        {items.length === 0 ? (
          <div className="py-10 text-center font-serif text-[16px] italic text-faint">— empty —</div>
        ) : (
          <div>
            {items.map((item, i) => (
              <TxnRow key={item.id} item={item} dateKey={dayKey!} index={i} />
            ))}
          </div>
        )}
        <div className="mt-2 flex items-center justify-between pt-3 text-[11px] uppercase tracking-[.18em] text-faint">
          <span>Total</span>
          <span className="font-serif text-[34px] tracking-[-.02em] text-ink">{fmt(total)}</span>
        </div>
      </div>
      <button
        onClick={closeDay}
        className="glass mt-3 w-full rounded-full py-[14px] font-mono text-[10px] uppercase tracking-[.18em] text-sub"
      >
        Close
      </button>
    </Sheet>
  )
}
