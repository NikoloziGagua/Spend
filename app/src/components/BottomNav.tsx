import { motion } from 'framer-motion'
import { BarChart3, Clock, Home, Menu, Wallet, type LucideIcon } from 'lucide-react'
import type { ViewId } from '../types'

const TABS: { id: ViewId; label: string; Icon: LucideIcon }[] = [
  { id: 'today', label: 'Today', Icon: Home },
  { id: 'budget', label: 'Budget', Icon: Wallet },
  { id: 'history', label: 'History', Icon: Clock },
  { id: 'stats', label: 'Stats', Icon: BarChart3 },
  { id: 'settings', label: 'More', Icon: Menu },
]

export function BottomNav({ view, onChange }: { view: ViewId; onChange: (v: ViewId) => void }) {
  return (
    <nav
      className="glass fixed left-1/2 z-[60] flex -translate-x-1/2 items-center gap-1 rounded-full p-[5px]"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
    >
      {TABS.map((t) => {
        const active = t.id === view
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            aria-label={t.label}
            className="relative flex items-center gap-1.5 rounded-full px-3.5 py-2.5"
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
            <t.Icon size={17} strokeWidth={2.2} className="relative z-[1]" />
            {active && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                className="relative z-[1] overflow-hidden whitespace-nowrap font-display text-[12px] font-bold"
              >
                {t.label}
              </motion.span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
