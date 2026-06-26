import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../lib/store'

export function Toast() {
  const { toast, showToast } = useStore()
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          className="glass pointer-events-none fixed left-1/2 z-[90] max-w-[90vw] -translate-x-1/2 rounded-full px-[22px] py-[13px] text-center text-[12px] uppercase tracking-[.05em] text-ink"
          style={{ bottom: 'calc(env(safe-area-inset-bottom) + 86px)' }}
          initial={{ opacity: 0, y: 70, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 70, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 360, damping: 30 }}
        >
          {toast.msg}
          {toast.undo && (
            <button
              onClick={() => {
                toast.undo?.()
                showToast('Restored')
              }}
              className="pointer-events-auto ml-3 font-bold uppercase tracking-[.12em] text-ink underline underline-offset-[3px]"
            >
              Undo
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
