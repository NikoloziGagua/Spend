import { Moon, Sun } from 'lucide-react'
import { CURRENCIES } from '../lib/format'
import { useStore } from '../lib/store'
import { useTheme } from '../lib/theme'

export function Header() {
  const { currency, setCurrency } = useStore()
  const { theme, toggle } = useTheme()

  const cycleCurrency = () => {
    const i = CURRENCIES.findIndex((c) => c.code === currency)
    setCurrency(CURRENCIES[(i + 1) % CURRENCIES.length].code)
  }
  const label = CURRENCIES.find((c) => c.code === currency)?.label ?? '€ EUR'

  return (
    <header className="relative z-[2] flex items-center justify-between px-[26px] pb-2 pt-[14px]">
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
    </header>
  )
}
