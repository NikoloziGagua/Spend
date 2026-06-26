import NumberFlow from '@number-flow/react'
import { AnimatePresence, motion } from 'framer-motion'
import type { CSSProperties, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { useStore } from '../lib/store'

/* Animated currency value (NumberFlow + Intl currency) */
export function Amount({
  value,
  className,
  style,
}: {
  value: number
  className?: string
  style?: CSSProperties
}) {
  const { currency } = useStore()
  return (
    <NumberFlow
      value={value}
      className={className}
      style={style}
      format={{ style: 'currency', currency, maximumFractionDigits: 2, minimumFractionDigits: 2 }}
    />
  )
}

/* Render an insight string with **bold** markers */
export function RichText({ text }: { text: string }) {
  const parts = text.split('**')
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-mono font-bold not-italic text-ink text-[0.82em]">
            {p}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  )
}

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="relative h-[25px] w-[42px] shrink-0 rounded-full transition-colors duration-200"
      style={{ background: on ? 'var(--accent)' : 'var(--line-strong)' }}
    >
      <motion.span
        className="absolute left-[2px] top-[2px] h-[21px] w-[21px] rounded-full bg-white"
        style={{ boxShadow: '0 1px 3px rgba(15,18,24,.25)' }}
        animate={{ x: on ? 17 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      />
    </button>
  )
}

/* Bottom sheet with drag-to-dismiss handle */
export function Sheet({
  open,
  onClose,
  children,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center"
          style={{ background: 'rgba(15,18,24,.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <motion.div
            className="w-full max-w-col px-3 pb-4"
            style={{ maxHeight: '90vh', overflowY: 'auto' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose()
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function SectionLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`uppercase-label ${className}`}>{children}</div>
}

/* Frosted glass bento card */
export function Card({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 28 }}
      className={`glass rounded-tile p-5 ${className}`}
    >
      {children}
    </motion.div>
  )
}

/* Scroll-reveal wrapper — animates in once as it enters the viewport */
export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay, type: 'spring', stiffness: 260, damping: 26 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* Big bold view header (small label + heavy title) */
export function ViewHeader({ label, title }: { label: string; title: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
      <div className="text-[13px] font-medium text-faint">{label}</div>
      <h1 className="mt-0.5 font-display text-[34px] font-extrabold leading-none tracking-[-.03em] text-ink">{title}</h1>
    </motion.div>
  )
}

/* Soft circular icon badge */
export function IconBadge({ icon: Icon, tone = 'ink' }: { icon: LucideIcon; tone?: 'ink' | 'danger' | 'ok' | 'warn' }) {
  const color = tone === 'danger' ? 'var(--danger)' : tone === 'ok' ? 'var(--ok)' : tone === 'warn' ? 'var(--warn)' : 'var(--ink)'
  return (
    <div
      className="flex h-9 w-9 items-center justify-center rounded-full"
      style={{ background: 'var(--accent-soft)', color }}
    >
      <Icon size={17} strokeWidth={2} />
    </div>
  )
}

/* Icon-badged stat tile with a bold display number */
export function StatTile({
  icon,
  label,
  children,
  tone,
  delay = 0,
}: {
  icon: LucideIcon
  label: string
  children: ReactNode
  tone?: 'ink' | 'danger' | 'ok' | 'warn'
  delay?: number
}) {
  return (
    <Card delay={delay} className="flex flex-col gap-3">
      <IconBadge icon={icon} tone={tone} />
      <div>
        <div className="font-display text-[27px] font-extrabold leading-none tracking-[-.02em] text-ink">{children}</div>
        <div className="mt-1.5 text-[13px] font-medium text-faint">{label}</div>
      </div>
    </Card>
  )
}

/* Inverted focal card (dark on light, light on dark) */
export function DarkCard({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 280, damping: 26 }}
      className={`relative overflow-hidden rounded-tile p-5 ${className}`}
      style={{ background: 'var(--ink)', color: 'var(--bg)', boxShadow: 'var(--shadow-pop)' }}
    >
      {children}
    </motion.div>
  )
}
