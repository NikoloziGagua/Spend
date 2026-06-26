import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { CATEGORIES, CatIcon, catLabel } from '../categories'
import { historyData, MONTH_NAMES } from '../lib/analytics'
import { parseKey, useStore } from '../lib/store'
import { useUI } from '../lib/uiContext'
import { Card, ViewHeader } from '../components/ui'

function highlight(text: string, q: string): ReactNode {
  if (!q) return text
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(re)
  return parts.map((p, i) =>
    re.test(p) && p.toLowerCase() === q.toLowerCase() ? (
      <mark key={i} className="rounded-[3px] bg-accentSoft px-0.5 text-ink">
        {p}
      </mark>
    ) : (
      <span key={i}>{p}</span>
    )
  )
}

export function HistoryView() {
  const { data, fmt } = useStore()
  const { openDay } = useUI()
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')

  const res = useMemo(() => historyData(data, filterCat, search), [data, filterCat, search])

  return (
    <div>
      <ViewHeader label="All activity" title="History" />
      <div className="glass mb-[18px] flex items-center gap-2.5 rounded-full px-4 py-3">
        <Search size={15} className="shrink-0 text-faint" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="search expenses…"
          className="flex-1 bg-transparent font-mono text-[14px] text-ink outline-none placeholder:text-faint"
        />
      </div>

      <div className="mb-[22px] flex gap-2 overflow-x-auto pb-0.5">
        {[{ id: 'all', label: 'All' }, ...CATEGORIES].map((c) => {
          const active = filterCat === c.id
          return (
            <button
              key={c.id}
              onClick={() => setFilterCat(c.id)}
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[.08em] transition-colors"
              style={{
                borderColor: active ? 'var(--accent)' : 'var(--line)',
                background: active ? 'var(--accent)' : 'transparent',
                color: active ? 'var(--accent-on)' : 'var(--sub)',
              }}
            >
              {c.id !== 'all' && <CatIcon id={c.id} size={13} />}
              {c.label}
            </button>
          )
        })}
      </div>

      {res.mode === 'search' ? (
        res.hits.length === 0 ? (
          <div className="py-10 text-center font-serif text-[16px] italic text-faint">— no matches —</div>
        ) : (
          <Card>
            {res.hits.map(({ key, e }, i) => (
            <button
              key={key + i}
              onClick={() => openDay(key)}
              className="block w-full border-b border-line py-3.5 text-left last:border-0"
            >
              <div className="mb-1 text-[9px] uppercase tracking-[.12em] text-faint">
                {parseKey(key).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} ·{' '}
                {catLabel(e.cat)}
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="flex items-center gap-1.5">
                  <CatIcon id={e.cat} size={13} className="text-faint" />
                  {highlight(e.desc || catLabel(e.cat), res.q)}
                </span>
                <span className="font-mono font-medium tabular-nums text-ink">{fmt(e.amount)}</span>
              </div>
            </button>
            ))}
          </Card>
        )
      ) : res.months.length === 0 ? (
        <div className="py-16 text-center font-serif text-[16px] italic text-faint">
          — nothing in the books yet —
        </div>
      ) : (
        res.months.map((mo, mi) => (
          <motion.div
            key={mo.mk}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: mi * 0.06 }}
            className="glass mb-4 rounded-tile p-5"
          >
            <div className="mb-1.5 flex items-baseline justify-between border-b border-line pb-3">
              <div className="font-serif text-[24px] italic text-ink">
                {MONTH_NAMES[mo.month - 1]} <span className="text-[14px] text-faint">{mo.year}</span>
              </div>
              <div className="font-serif text-[22px] tabular-nums text-ink">{fmt(mo.total)}</div>
            </div>
            {mo.days.map((day) => {
              const cats = [...new Set(day.items.map((i) => i.cat))].slice(0, 5)
              const label = parseKey(day.key).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })
              return (
                <button
                  key={day.key}
                  onClick={() => openDay(day.key)}
                  className="grid w-full grid-cols-[56px_1fr_auto] items-baseline gap-3.5 border-b border-line py-3.5 text-left transition-[padding] hover:pl-1.5"
                >
                  <span className="text-[11px] uppercase tracking-[.08em] text-faint">{label}</span>
                  <span className="flex items-center gap-1.5 text-[13px] text-sub">
                    {day.items.length} item{day.items.length === 1 ? '' : 's'}
                    <span className="flex items-center gap-0.5 text-faint">
                      {cats.map((c) => (
                        <CatIcon key={c} id={c} size={12} />
                      ))}
                    </span>
                  </span>
                  <span className="font-mono font-medium tabular-nums text-ink">{fmt(day.total)}</span>
                </button>
              )
            })}
          </motion.div>
        ))
      )}
    </div>
  )
}
