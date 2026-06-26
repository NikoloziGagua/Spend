import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { BottomNav } from './components/BottomNav'
import { Header } from './components/Header'
import { DaySheet, EditSheet } from './components/sheets'
import { Toast } from './components/Toast'
import { BudgetView } from './views/BudgetView'
import { HistoryView } from './views/HistoryView'
import { SettingsView } from './views/SettingsView'
import { StatsView } from './views/StatsView'
import { TodayView } from './views/TodayView'
import type { ViewId } from './types'

const VIEWS: Record<ViewId, () => JSX.Element> = {
  today: TodayView,
  budget: BudgetView,
  history: HistoryView,
  stats: StatsView,
  settings: SettingsView,
}

export default function App() {
  const [view, setView] = useState<ViewId>('today')
  const Current = VIEWS[view]

  // keyboard shortcuts 1-4
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return
      const map: Record<string, ViewId> = { '1': 'today', '2': 'budget', '3': 'history', '4': 'stats' }
      if (map[e.key]) setView(map[e.key])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div
      className="relative mx-auto min-h-[100dvh] max-w-col"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 18px)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 120px)' }}
    >
      <Header />

      <main className="px-4 pt-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.28 }}
          >
            <Current />
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav view={view} onChange={setView} />
      <Toast />
      <EditSheet />
      <DaySheet />
    </div>
  )
}
