export type CatId =
  | 'food'
  | 'groceries'
  | 'transport'
  | 'fun'
  | 'home'
  | 'health'
  | 'shop'
  | 'bills'
  | 'travel'
  | 'gift'
  | 'other'

export interface Expense {
  id: string
  desc: string
  cat: CatId
  amount: number
  note: string
  ts: number
  recurringId?: string
}

export type Store = Record<string, Expense[]>

export interface Settings {
  autoRecurring: boolean
  autocomplete: boolean
  sounds: boolean
  warnings: boolean
}

export interface Budgets {
  overall: number
  byCat: Record<string, number>
}

export type Freq = 'weekly' | 'monthly' | 'yearly'

export interface Recurring {
  id: string
  desc: string
  cat: CatId
  amount: number
  freq: Freq
  startDate: string
  nextDate: string
}

export type ViewId = 'today' | 'budget' | 'history' | 'stats' | 'settings'
