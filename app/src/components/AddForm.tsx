import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { CATEGORIES, CatIcon, catById } from '../categories'
import { autocomplete, quickAmounts } from '../lib/analytics'
import { haptic, playTone } from '../lib/effects'
import { useStore } from '../lib/store'
import type { CatId } from '../types'

export function AddForm() {
  const { data, settings, fmt, addExpense } = useStore()
  const [desc, setDesc] = useState('')
  const [amt, setAmt] = useState('')
  const [cat, setCat] = useState<CatId>('food')
  const [catOpen, setCatOpen] = useState(false)
  const [acOpen, setAcOpen] = useState(false)
  const [shake, setShake] = useState(false)
  const amtRef = useRef<HTMLInputElement>(null)

  const quick = useMemo(() => quickAmounts(data), [data])
  const acItems = useMemo(
    () => (settings.autocomplete && acOpen ? autocomplete(data, desc) : []),
    [data, desc, acOpen, settings.autocomplete]
  )
  const current = catById(cat)

  const onAmt = (v: string) => {
    let s = v.replace(/[^\d.,]/g, '')
    const parts = s.split(/[.,]/)
    if (parts.length > 2) s = parts[0] + '.' + parts.slice(1).join('')
    setAmt(s)
  }

  const submit = () => {
    const n = parseFloat(amt.replace(',', '.'))
    if (!n || n <= 0) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
      amtRef.current?.focus()
      return
    }
    addExpense({ desc: desc.trim(), cat, amount: n })
    playTone(settings.sounds)
    haptic(10)
    setDesc('')
    setAmt('')
    setCat('food')
    setCatOpen(false)
    setAcOpen(false)
  }

  return (
    <div className="mb-[30px] border-b border-line pb-2">
      <span className="mb-[10px] block text-[9px] uppercase tracking-[.2em] text-faint">+ New expense</span>

      <div className="mb-[18px] flex items-end gap-4">
        <div className="relative min-w-0 flex-1">
          <input
            value={desc}
            onChange={(e) => {
              setDesc(e.target.value)
              setAcOpen(true)
            }}
            onFocus={() => setAcOpen(true)}
            onBlur={() => setTimeout(() => setAcOpen(false), 120)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !acItems.length) amtRef.current?.focus()
            }}
            placeholder="what was it..."
            autoComplete="off"
            className="w-full border-b border-line bg-transparent py-2 font-mono text-[16px] text-ink outline-none transition-colors placeholder:text-faint focus:border-ink"
          />
          <AnimatePresence>
            {acItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="glass absolute left-0 right-0 top-full z-50 mt-2 max-h-[190px] overflow-y-auto rounded-2xl"
              >
                {acItems.map((it, i) => (
                  <button
                    key={i}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      setDesc(it.desc)
                      setCat(it.cat)
                      setAmt(it.amount.toFixed(2))
                      setAcOpen(false)
                    }}
                    className="flex w-full items-center justify-between border-b border-line px-4 py-[9px] text-left text-[13px] last:border-0 hover:bg-accentSoft"
                  >
                    <span className="flex items-center gap-1.5">
                      <CatIcon id={it.cat} size={13} className="text-faint" />
                      {it.desc}
                    </span>
                    <span className="text-[9px] uppercase tracking-[.1em] text-faint">{fmt(it.amount)}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.input
          ref={amtRef}
          value={amt}
          onChange={(e) => onAmt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          inputMode="decimal"
          placeholder="0.00"
          animate={shake ? { x: [0, -4, 4, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="w-[110px] border-b border-line bg-transparent py-2 text-right font-mono text-[24px] font-medium text-ink outline-none transition-colors placeholder:text-faint focus:border-ink"
        />
      </div>

      {/* quick amounts */}
      <div className="mb-[18px] flex flex-wrap gap-3">
        {quick.map((q) => (
          <button
            key={q}
            onClick={() => {
              setAmt(q.toFixed(2))
              amtRef.current?.focus()
            }}
            className="relative py-1 font-mono text-[12px] tabular-nums text-faint transition-colors after:absolute after:inset-x-0.5 after:bottom-0 after:h-px after:bg-line hover:text-ink"
          >
            {fmt(q)}
          </button>
        ))}
      </div>

      {/* collapsible category selector */}
      <button
        onClick={() => setCatOpen((v) => !v)}
        aria-expanded={catOpen}
        className="mb-4 flex w-full items-center justify-between rounded-[14px] border border-line px-[14px] py-3 transition-colors hover:border-faint aria-expanded:border-ink"
      >
        <span className="flex items-center gap-2.5 text-[11px] uppercase tracking-[.12em] text-sub">
          <span className="text-faint">Category</span>
          <CatIcon id={cat} size={16} className="text-sub" />
          <span className="font-medium text-ink">{current.label}</span>
        </span>
        <ChevronDown
          size={14}
          className="text-faint transition-transform duration-200"
          style={{ transform: catOpen ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      <AnimatePresence initial={false}>
        {catOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mb-5 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const active = c.id === cat
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCat(c.id)
                      setCatOpen(false)
                    }}
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
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={submit}
        className="w-full rounded-full bg-accent py-[15px] font-mono text-[11px] font-bold uppercase tracking-[.2em] text-accentOn transition-transform hover:-translate-y-px active:scale-[.985]"
      >
        Record →
      </button>
    </div>
  )
}
