import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Budgets, CatId, Expense, Recurring, Settings, Store } from '../types'
import { dateKey, makeFmt, monthKey, parseKey, todayKey, uid } from './format'

const K = {
  data: 'ledger.v2',
  settings: 'ledger.settings',
  budgets: 'ledger.budgets',
  recurring: 'ledger.recurring',
  currency: 'ledger.currency',
}

const DEFAULT_SETTINGS: Settings = {
  autoRecurring: true,
  autocomplete: true,
  sounds: false,
  warnings: true,
}

function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}

function loadData(): Store {
  let s = load<Store>(K.data, {})
  // migrate v1 → v2 (adds note field) for existing users
  const v1 = localStorage.getItem('ledger.v1')
  if (v1 && Object.keys(s).length === 0) {
    try {
      const old = JSON.parse(v1) as Record<string, Expense[]>
      s = {}
      Object.keys(old).forEach((k) => {
        s[k] = (old[k] || []).map((e) => ({ ...e, note: e.note || '' }))
      })
      localStorage.setItem(K.data, JSON.stringify(s))
    } catch {
      /* ignore */
    }
  }
  return s
}

/* ---- recurring auto-log (pure) ---- */
function processRecurring(data: Store, recurring: Recurring[]) {
  const today = todayKey()
  const nextData: Store = { ...data }
  const nextRec = recurring.map((r) => ({ ...r }))
  let added = 0
  nextRec.forEach((r) => {
    if (!r.nextDate) r.nextDate = r.startDate || today
    while (r.nextDate <= today) {
      const day = nextData[r.nextDate] || []
      const alreadyLogged = day.some((e) => e.recurringId === r.id)
      if (!alreadyLogged) {
        nextData[r.nextDate] = [
          ...day,
          {
            id: uid(),
            desc: r.desc,
            cat: r.cat,
            amount: r.amount,
            note: '',
            ts: Date.now(),
            recurringId: r.id,
          },
        ]
        added++
      }
      const d = parseKey(r.nextDate)
      if (r.freq === 'weekly') d.setDate(d.getDate() + 7)
      else if (r.freq === 'yearly') d.setFullYear(d.getFullYear() + 1)
      else d.setMonth(d.getMonth() + 1)
      r.nextDate = dateKey(d)
    }
  })
  return { data: nextData, recurring: nextRec, added }
}

interface ToastState {
  id: number
  msg: string
  undo?: () => void
}

interface StoreCtx {
  data: Store
  settings: Settings
  budgets: Budgets
  recurring: Recurring[]
  currency: string
  setCurrency: (c: string) => void
  fmt: (n: number) => string
  // derived
  dayItems: (k: string) => Expense[]
  dayTotal: (k: string) => number
  // actions
  addExpense: (e: { desc: string; cat: CatId; amount: number; note?: string }) => Expense
  updateExpense: (dKey: string, id: string, patch: Partial<Expense>) => void
  deleteExpense: (dKey: string, id: string) => void
  setOverallBudget: (n: number) => void
  setCatBudget: (cat: string, n: number) => void
  addRecurring: (r: Omit<Recurring, 'id' | 'nextDate'>) => void
  deleteRecurring: (id: string) => void
  setSettings: (patch: Partial<Settings>) => void
  importData: (parsed: any) => void
  clearAll: () => void
  // toast
  toast: ToastState | null
  showToast: (msg: string, undo?: () => void) => void
}

const Ctx = createContext<StoreCtx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Store>(loadData)
  const [settings, setSettingsState] = useState<Settings>(() => ({
    ...DEFAULT_SETTINGS,
    ...load<Partial<Settings>>(K.settings, {}),
  }))
  const [budgets, setBudgets] = useState<Budgets>(() =>
    load<Budgets>(K.budgets, { overall: 0, byCat: {} })
  )
  const [recurring, setRecurring] = useState<Recurring[]>(() => load<Recurring[]>(K.recurring, []))
  const [currency, setCurrency] = useState<string>(() => localStorage.getItem(K.currency) || 'EUR')
  const [toast, setToast] = useState<ToastState | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  // persist
  useEffect(() => localStorage.setItem(K.data, JSON.stringify(data)), [data])
  useEffect(() => localStorage.setItem(K.settings, JSON.stringify(settings)), [settings])
  useEffect(() => localStorage.setItem(K.budgets, JSON.stringify(budgets)), [budgets])
  useEffect(() => localStorage.setItem(K.recurring, JSON.stringify(recurring)), [recurring])
  useEffect(() => localStorage.setItem(K.currency, currency), [currency])

  const fmt = useMemo(() => makeFmt(currency), [currency])

  const showToast = useCallback((msg: string, undo?: () => void) => {
    const id = Date.now()
    setToast({ id, msg, undo })
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => {
      setToast((t) => (t && t.id === id ? null : t))
    }, 4500)
  }, [])

  // recurring auto-log on mount + at midnight rollover
  const runRecurring = useCallback(() => {
    if (!settings.autoRecurring) return
    setData((d) => {
      const res = processRecurring(d, recurring)
      if (res.added > 0) {
        setRecurring(res.recurring)
        window.setTimeout(
          () => showToast(`${res.added} recurring expense${res.added === 1 ? '' : 's'} auto-logged`),
          600
        )
        return res.data
      }
      return d
    })
  }, [recurring, settings.autoRecurring, showToast])

  useEffect(() => {
    runRecurring()
    let last = todayKey()
    const iv = window.setInterval(() => {
      const k = todayKey()
      if (k !== last) {
        last = k
        runRecurring()
      }
    }, 60000)
    return () => window.clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dayItems = useCallback((k: string) => data[k] || [], [data])
  const dayTotal = useCallback(
    (k: string) => (data[k] || []).reduce((s, e) => s + e.amount, 0),
    [data]
  )

  const addExpense: StoreCtx['addExpense'] = useCallback((e) => {
    const item: Expense = {
      id: uid(),
      desc: e.desc,
      cat: e.cat,
      amount: e.amount,
      note: e.note || '',
      ts: Date.now(),
    }
    const k = todayKey()
    setData((d) => ({ ...d, [k]: [...(d[k] || []), item] }))
    return item
  }, [])

  const updateExpense: StoreCtx['updateExpense'] = useCallback((dKey, id, patch) => {
    setData((d) => ({
      ...d,
      [dKey]: (d[dKey] || []).map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }))
  }, [])

  const deleteExpense: StoreCtx['deleteExpense'] = useCallback(
    (dKey, id) => {
      let backup: Expense[] | null = null
      setData((d) => {
        backup = d[dKey] ? [...d[dKey]] : []
        const next = { ...d }
        const filtered = (d[dKey] || []).filter((e) => e.id !== id)
        if (filtered.length) next[dKey] = filtered
        else delete next[dKey]
        return next
      })
      showToast('Expense removed', () => {
        if (backup) setData((d) => ({ ...d, [dKey]: backup as Expense[] }))
      })
    },
    [showToast]
  )

  const setOverallBudget = useCallback((n: number) => {
    setBudgets((b) => ({ ...b, overall: n }))
  }, [])
  const setCatBudget = useCallback((cat: string, n: number) => {
    setBudgets((b) => {
      const byCat = { ...b.byCat }
      if (n > 0) byCat[cat] = n
      else delete byCat[cat]
      return { ...b, byCat }
    })
  }, [])

  const addRecurring: StoreCtx['addRecurring'] = useCallback(
    (r) => {
      const rec: Recurring = { ...r, id: uid(), nextDate: r.startDate }
      setRecurring((list) => [...list, rec])
      window.setTimeout(() => runRecurring(), 50)
    },
    [runRecurring]
  )
  const deleteRecurring = useCallback((id: string) => {
    setRecurring((list) => list.filter((r) => r.id !== id))
  }, [])

  const setSettings = useCallback((patch: Partial<Settings>) => {
    setSettingsState((s) => ({ ...s, ...patch }))
  }, [])

  const importData = useCallback(
    (parsed: any) => {
      if (parsed && typeof parsed === 'object') {
        if (parsed.data) setData(parsed.data)
        else setData(parsed)
        if (parsed.budgets) setBudgets(parsed.budgets)
        if (parsed.recurring) setRecurring(parsed.recurring)
        if (parsed.settings) setSettingsState({ ...DEFAULT_SETTINGS, ...parsed.settings })
        showToast('Data imported')
      }
    },
    [showToast]
  )

  const clearAll = useCallback(() => {
    setData({})
    setBudgets({ overall: 0, byCat: {} })
    setRecurring([])
    showToast('All data cleared')
  }, [showToast])

  const value: StoreCtx = {
    data,
    settings,
    budgets,
    recurring,
    currency,
    setCurrency,
    fmt,
    dayItems,
    dayTotal,
    addExpense,
    updateExpense,
    deleteExpense,
    setOverallBudget,
    setCatBudget,
    addRecurring,
    deleteRecurring,
    setSettings,
    importData,
    clearAll,
    toast,
    showToast,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useStore must be used within StoreProvider')
  return c
}

export { monthKey, todayKey, dateKey, parseKey }
