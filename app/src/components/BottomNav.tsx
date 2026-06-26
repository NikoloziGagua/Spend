import { motion } from 'framer-motion'
import type { ViewId } from '../types'

const TABS: { id: ViewId; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'budget', label: 'Budget' },
  { id: 'history', label: 'History' },
  { id: 'stats', label: 'Stats' },
  { id: 'settings', label: 'More' },
]

export function BottomNav({ view, onChange }: { view: ViewId; onChange: (v: ViewId) => void }) {
  return (
    <nav
      className="glass fixed left-1/2 z-[60] flex max-w-[calc(100vw-32px)] -translate-x-1/2 gap-0.5 overflow-x-auto rounded-full p-[5px]"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 18px)' }}
    >
      {TABS.map((t) => {
        const active = t.id === view
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className="relative rounded-full px-[15px] py-[9px] font-mono text-[10px] uppercase tracking-[.12em] transition-colors"
            style={{ color: active ? 'var(--accent-on)' : 'var(--faint)' }}
          >
            {active && (
              <motion.span
                layoutId="navpill"
                className="absolute inset-0 rounded-full"
                style={{ background: 'var(--accent)' }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-[1] whitespace-nowrap">{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
