import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Expense } from '../types'

interface EditTarget {
  item: Expense
  dateKey: string
}

interface UICtx {
  edit: EditTarget | null
  dayKey: string | null
  openEdit: (item: Expense, dateKey: string) => void
  openDay: (key: string) => void
  closeEdit: () => void
  closeDay: () => void
}

const Ctx = createContext<UICtx | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
  const [edit, setEdit] = useState<EditTarget | null>(null)
  const [dayKey, setDayKey] = useState<string | null>(null)

  const openEdit = useCallback((item: Expense, dateKey: string) => setEdit({ item, dateKey }), [])
  const openDay = useCallback((key: string) => setDayKey(key), [])
  const closeEdit = useCallback(() => setEdit(null), [])
  const closeDay = useCallback(() => setDayKey(null), [])

  const value = useMemo(
    () => ({ edit, dayKey, openEdit, openDay, closeEdit, closeDay }),
    [edit, dayKey, openEdit, openDay, closeEdit, closeDay]
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useUI() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useUI outside provider')
  return c
}
