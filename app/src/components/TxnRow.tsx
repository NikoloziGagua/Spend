import { animate, AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion'
import { Repeat } from 'lucide-react'
import { useState } from 'react'
import { CatIcon, catLabel } from '../categories'
import { haptic } from '../lib/effects'
import { useStore } from '../lib/store'
import { useUI } from '../lib/uiContext'
import type { Expense } from '../types'

const THRESH = 84

export function TxnRow({ item, dateKey, index }: { item: Expense; dateKey: string; index: number }) {
  const { fmt, deleteExpense } = useStore()
  const { openEdit } = useUI()
  const [expanded, setExpanded] = useState(false)

  const x = useMotionValue(0)
  const delOpacity = useTransform(x, [-THRESH, -8], [1, 0])
  const editOpacity = useTransform(x, [8, THRESH], [0, 1])

  return (
    <motion.div
      className="relative overflow-hidden border-b border-line last:border-0"
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3), type: 'spring', stiffness: 400, damping: 36 }}
      layout
    >
      {/* edit affordance (revealed on swipe right) */}
      <motion.div
        style={{ opacity: editOpacity, background: 'var(--accent)', color: 'var(--accent-on)' }}
        className="pointer-events-none absolute inset-0 flex items-center justify-start pl-[18px] text-[9px] uppercase tracking-[.18em]"
      >
        Edit
      </motion.div>
      {/* delete affordance (revealed on swipe left) */}
      <motion.div
        style={{ opacity: delOpacity }}
        className="pointer-events-none absolute inset-0 flex items-center justify-end bg-danger pr-[18px] text-[9px] uppercase tracking-[.18em] text-white"
      >
        Delete
      </motion.div>

      <motion.div
        className="relative z-[1] px-0.5 py-[14px]"
        style={{ x, background: 'var(--card)', touchAction: 'pan-y' }}
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.55}
        onDragEnd={(_, info) => {
          const dx = info.offset.x
          if (dx <= -THRESH) {
            haptic(14)
            animate(x, -400, { duration: 0.2 })
            setTimeout(() => deleteExpense(dateKey, item.id), 150)
          } else if (dx >= THRESH) {
            haptic(10)
            animate(x, 0, { type: 'spring', stiffness: 420, damping: 34 })
            setTimeout(() => openEdit(item, dateKey), 110)
          } else {
            animate(x, 0, { type: 'spring', stiffness: 420, damping: 34 })
          }
        }}
      >
        <div className="flex items-start gap-3">
          <CatIcon id={item.cat} size={16} className="mt-[3px] shrink-0 text-faint" />
          <div className="min-w-0 flex-1">
            <motion.div
              onTap={() => setExpanded((v) => !v)}
              className="cursor-pointer break-words text-[15px] leading-tight"
            >
              {item.desc || catLabel(item.cat)}
              {item.recurringId && (
                <span className="ml-2 inline-flex items-center gap-1 align-middle text-[9px] uppercase tracking-[.1em] text-faint">
                  <Repeat size={10} /> recurring
                </span>
              )}
            </motion.div>
            <div className="mt-1 text-[9px] uppercase tracking-[.12em] text-faint">{catLabel(item.cat)}</div>
            {item.note && (
              <div className="mt-1 font-serif text-[13px] italic text-sub">&ldquo;{item.note}&rdquo;</div>
            )}
          </div>
          <div className="pt-[1px] font-mono text-[15px] font-medium tabular-nums">{fmt(item.amount)}</div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              className="flex justify-start gap-2 overflow-hidden"
              initial={{ height: 0, opacity: 0, paddingTop: 0 }}
              animate={{ height: 'auto', opacity: 1, paddingTop: 10 }}
              exit={{ height: 0, opacity: 0, paddingTop: 0 }}
              transition={{ duration: 0.22 }}
            >
              <button
                onClick={() => openEdit(item, dateKey)}
                className="rounded-full border border-line px-3 py-1.5 font-mono text-[9px] uppercase tracking-[.12em] text-sub transition-colors hover:border-ink hover:bg-ink hover:text-bg"
              >
                Edit
              </button>
              <button
                onClick={() => deleteExpense(dateKey, item.id)}
                className="rounded-full border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[.12em] text-danger transition-colors hover:text-white"
                style={{ borderColor: 'color-mix(in srgb, var(--danger) 30%, transparent)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--danger)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
