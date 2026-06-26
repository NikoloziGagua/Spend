import { AnimatePresence, motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { CURRENCIES } from '../lib/format'
import { useStore, todayKey } from '../lib/store'
import { useTheme } from '../lib/theme'
import { Amount } from './ui'
import type { ViewId } from '../types'

export function Header({ view }: { view: ViewId }) {
  const { currency, setCurrency, dayTotal } = useStore()
  const { theme, toggle } = useTheme()

  const cycleCurrency = () => {
    const i = CURRENCIES.findIndex((c) => c.code === currency)
    setCurrency(CURRENCIES[(i + 1) % CURRENCIES.length].code)
  }
  const label = CURRENCIES.find((c) => c.code === currency)?.label ?? '€ EUR'
  const dateStr = new Date()
    .toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
    .toUpperCase()

  return (
    <header className="relative z-[2] px-[26px] pt-[14px]">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[.22em] text-faint">
          spent<span className="mx-px opacity-60">&amp;</span>saved
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={cycleCurrency}
            className="flex h-7 items-center rounded-full px-2 font-mono text-[10px] tracking-[.12em] text-faint transition-colors hover:text-ink"
          >
            {label}
          </button>
          <button
            onClick={toggle}
            aria-label="theme"
            className="flex h-7 w-7 items-center justify-center rounded-full text-faint transition-colors hover:text-ink active:scale-90"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {view === 'today' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="pt-[34px]">
              <span className="text-[11px] uppercase tracking-[.16em] text-faint">
                Spent today <span className="mx-0.5 opacity-50">·</span> {dateStr}
              </span>
              <Amount
                value={dayTotal(todayKey())}
                className="mt-2 block font-serif leading-[.92] tracking-[-.02em] text-ink"
                style={{ fontSize: 'clamp(52px, 19vw, 80px)' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
