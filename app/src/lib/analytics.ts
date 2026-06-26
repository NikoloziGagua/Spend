import type { Budgets, CatId, Expense, Settings, Store } from '../types'
import { catLabel } from '../categories'
import { dateKey, monthKey, parseKey, todayKey } from './format'

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export type Fmt = (n: number) => string

export interface Insight {
  type: '' | 'warn' | 'danger'
  text: string // supports **bold** markers
}

const monthSpentOf = (data: Store, mk: string) => {
  let total = 0
  Object.keys(data).forEach((k) => {
    if (k.startsWith(mk)) (data[k] || []).forEach((e) => (total += e.amount))
  })
  return total
}

export function monthSummary(data: Store) {
  const mk = monthKey()
  let total = 0
  let count = 0
  const days = new Set<string>()
  Object.keys(data).forEach((k) => {
    if (k.startsWith(mk)) {
      ;(data[k] || []).forEach((e) => {
        total += e.amount
        count++
      })
      if ((data[k] || []).length) days.add(k)
    }
  })
  const now = new Date()
  const daysSoFar = now.getDate()
  return {
    total,
    count,
    activeDays: days.size,
    avg: daysSoFar > 0 ? total / daysSoFar : 0,
    monthName: now.toLocaleDateString(undefined, { month: 'long' }),
  }
}

export function buildInsights(
  data: Store,
  budgets: Budgets,
  settings: Settings,
  fmt: Fmt
): Insight[] {
  if (!settings.warnings) return []
  const insights: Insight[] = []
  const mk = monthKey()
  const monthSpent = monthSpentOf(data, mk)

  if (budgets.overall > 0) {
    const pct = monthSpent / budgets.overall
    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const dayOfMonth = now.getDate()
    const expectedPct = dayOfMonth / daysInMonth
    if (pct >= 1) {
      insights.push({
        type: 'danger',
        text: `Over budget — you've spent **${fmt(monthSpent)}** of **${fmt(budgets.overall)}** this month.`,
      })
    } else if (pct > expectedPct + 0.15) {
      const left = budgets.overall - monthSpent
      const daysLeft = daysInMonth - dayOfMonth
      const dailyLeft = daysLeft > 0 ? left / daysLeft : 0
      insights.push({
        type: 'warn',
        text: `Spending faster than planned. **${fmt(dailyLeft)}/day** left to stay within budget.`,
      })
    } else if (pct < expectedPct - 0.2 && dayOfMonth > 7) {
      insights.push({
        type: '',
        text: `On track. You've used **${Math.round(pct * 100)}%** of your budget with **${Math.round(
          expectedPct * 100
        )}%** of the month gone.`,
      })
    }
  }

  const catTotals: Record<string, number> = {}
  Object.keys(data).forEach((k) => {
    if (k.startsWith(mk)) (data[k] || []).forEach((e) => (catTotals[e.cat] = (catTotals[e.cat] || 0) + e.amount))
  })
  Object.keys(budgets.byCat || {}).forEach((cat) => {
    const lim = budgets.byCat[cat]
    if (!lim || lim <= 0) return
    const spent = catTotals[cat] || 0
    if (spent >= lim) {
      insights.push({ type: 'warn', text: `**${catLabel(cat)}** is over its limit (${fmt(spent)} of ${fmt(lim)}).` })
    }
  })

  let recentSpending = 0
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    if ((data[dateKey(d)] || []).length > 0) recentSpending++
    else break
  }
  if (recentSpending >= 7) {
    insights.push({ type: 'warn', text: `You've spent something every day for **${recentSpending} days**. Try a no-spend day?` })
  }

  const yest = new Date()
  yest.setDate(yest.getDate() - 1)
  if ((data[dateKey(yest)] || []).length === 0) {
    insights.push({ type: '', text: `Yesterday was a no-spend day. **+1** in your books.` })
  }

  const todayItems = data[todayKey()] || []
  const todayTotal = todayItems.reduce((s, e) => s + e.amount, 0)
  if (todayItems.length > 1) {
    const biggest = todayItems.reduce((a, b) => (b.amount > a.amount ? b : a), todayItems[0])
    if (todayTotal > 0 && biggest.amount / todayTotal > 0.6) {
      insights.push({
        type: '',
        text: `**${biggest.desc || catLabel(biggest.cat)}** is most of today's spending (${fmt(biggest.amount)}).`,
      })
    }
  }

  if (monthSpent > 0 && new Date().getDate() >= 5) {
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    const lmk = monthKey(lastMonth)
    const dayOfMonth = new Date().getDate()
    let lastMonthSamePoint = 0
    Object.keys(data).forEach((k) => {
      if (!k.startsWith(lmk)) return
      if (parseKey(k).getDate() <= dayOfMonth) (data[k] || []).forEach((e) => (lastMonthSamePoint += e.amount))
    })
    if (lastMonthSamePoint > 0) {
      const diff = monthSpent - lastMonthSamePoint
      const pct = Math.abs((diff / lastMonthSamePoint) * 100)
      if (pct > 15) {
        insights.push(
          diff > 0
            ? { type: 'warn', text: `Spending **${pct.toFixed(0)}% more** than this point last month.` }
            : { type: '', text: `Spending **${pct.toFixed(0)}% less** than this point last month. Nice.` }
        )
      }
    }
  }

  return insights.slice(0, 2)
}

export function quickAmounts(data: Store): number[] {
  const counts: Record<number, number> = {}
  Object.values(data)
    .flat()
    .forEach((e) => {
      const r = Math.round(e.amount)
      if (r >= 1 && r <= 100) counts[r] = (counts[r] || 0) + 1
    })
  const top = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([n]) => Number(n))
  const defaults = [5, 10, 20].filter((d) => !top.includes(d))
  const all = [...top, ...defaults].slice(0, 5)
  return all.length ? all : [5, 10, 20]
}

export interface AcItem {
  desc: string
  cat: CatId
  amount: number
  count: number
}

export function autocomplete(data: Store, query: string): AcItem[] {
  if (!query || query.length < 2) return []
  const q = query.toLowerCase()
  const seen = new Map<string, AcItem>()
  Object.keys(data)
    .sort((a, b) => b.localeCompare(a))
    .forEach((k) => {
      ;(data[k] || []).forEach((e) => {
        if (!e.desc) return
        const lc = e.desc.toLowerCase()
        if (!lc.includes(q)) return
        if (!seen.has(lc)) seen.set(lc, { desc: e.desc, cat: e.cat, amount: e.amount, count: 1 })
        else seen.get(lc)!.count++
      })
    })
  return Array.from(seen.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}

/* ---------- stats ---------- */
export interface DayPoint {
  key: string
  total: number
  isToday: boolean
  hasSpending: boolean
}
export interface CalCell {
  day: number
  key: string
  total: number
  level: 0 | 1 | 2 | 3 | 4
  isToday: boolean
}
export interface CatTotal {
  cat: CatId
  amount: number
  pct: number
}

export function statsData(data: Store, calYear: number, calMonth: number) {
  let totalAll = 0
  let countAll = 0
  let biggestDay = 0
  const activeDays = new Set<string>()
  Object.keys(data).forEach((k) => {
    const dt = (data[k] || []).reduce((s, e) => s + e.amount, 0)
    if ((data[k] || []).length > 0) activeDays.add(k)
    totalAll += dt
    countAll += (data[k] || []).length
    if (dt > biggestDay) biggestDay = dt
  })
  const avg = countAll ? totalAll / countAll : 0

  const now = new Date()
  let noSpend = 0
  for (let i = 1; i <= now.getDate(); i++) {
    const k = dateKey(new Date(now.getFullYear(), now.getMonth(), i))
    if (!(data[k] || []).length) noSpend++
  }

  const days: DayPoint[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const k = dateKey(d)
    const total = (data[k] || []).reduce((s, e) => s + e.amount, 0)
    days.push({ key: k, total, isToday: k === todayKey(), hasSpending: total > 0 })
  }
  const dayMax = Math.max(...days.map((d) => d.total), 1)

  // calendar
  const first = new Date(calYear, calMonth, 1)
  const offset = (first.getDay() + 6) % 7
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  let monthMax = 0
  for (let dd = 1; dd <= daysInMonth; dd++) {
    const k = dateKey(new Date(calYear, calMonth, dd))
    const t = (data[k] || []).reduce((s, e) => s + e.amount, 0)
    if (t > monthMax) monthMax = t
  }
  const calCells: CalCell[] = []
  for (let dd = 1; dd <= daysInMonth; dd++) {
    const k = dateKey(new Date(calYear, calMonth, dd))
    const t = (data[k] || []).reduce((s, e) => s + e.amount, 0)
    let level: CalCell['level'] = 0
    if (t > 0 && monthMax > 0) {
      const r = t / monthMax
      level = r > 0.75 ? 4 : r > 0.5 ? 3 : r > 0.25 ? 2 : 1
    }
    calCells.push({ day: dd, key: k, total: t, level, isToday: k === todayKey() })
  }

  // day of week (avg), Mon-first
  const dowTotals = [0, 0, 0, 0, 0, 0, 0]
  const dowCounts = [0, 0, 0, 0, 0, 0, 0]
  Object.keys(data).forEach((k) => {
    const t = (data[k] || []).reduce((s, e) => s + e.amount, 0)
    if (t > 0) {
      const dow = parseKey(k).getDay()
      dowTotals[dow] += t
      dowCounts[dow]++
    }
  })
  const dowAvgRaw = dowTotals.map((t, i) => (dowCounts[i] ? t / dowCounts[i] : 0))
  const reorder = [1, 2, 3, 4, 5, 6, 0]
  const dowAvg = reorder.map((di) => dowAvgRaw[di])
  const dowMax = Math.max(...dowAvg, 1)

  // category totals this month
  const mk = monthKey()
  const ct: Record<string, number> = {}
  Object.keys(data).forEach((k) => {
    if (!k.startsWith(mk)) return
    ;(data[k] || []).forEach((e) => (ct[e.cat] = (ct[e.cat] || 0) + e.amount))
  })
  const sorted = Object.entries(ct).sort((a, b) => b[1] - a[1])
  const monthSum = sorted.reduce((s, [, v]) => s + v, 0)
  const catTotals: CatTotal[] = sorted.map(([cat, amount]) => ({
    cat: cat as CatId,
    amount,
    pct: monthSum ? Math.round((amount / monthSum) * 100) : 0,
  }))
  const catMax = sorted.length ? sorted[0][1] : 1

  // top expenses
  const all: { key: string; e: Expense }[] = []
  Object.keys(data).forEach((k) => (data[k] || []).forEach((e) => all.push({ key: k, e })))
  all.sort((a, b) => b.e.amount - a.e.amount)
  const topExpenses = all.slice(0, 5)

  return {
    totalAll,
    countAll,
    avg,
    biggestDay,
    activeDays: activeDays.size,
    noSpend,
    days,
    dayMax,
    calCells,
    calOffset: offset,
    dowAvg,
    dowMax,
    catTotals,
    catMax,
    topExpenses,
  }
}

export interface SearchHit {
  key: string
  e: Expense
}
export interface DayGroup {
  key: string
  items: Expense[]
  total: number
}
export interface MonthGroup {
  mk: string
  year: number
  month: number
  total: number
  days: DayGroup[]
}

export function historyData(data: Store, filterCat: string, search: string) {
  const q = search.trim().toLowerCase()
  if (q) {
    const hits: SearchHit[] = []
    Object.keys(data)
      .sort((a, b) => b.localeCompare(a))
      .forEach((k) => {
        ;(data[k] || []).forEach((e) => {
          const matches =
            (e.desc || '').toLowerCase().includes(q) ||
            (e.note || '').toLowerCase().includes(q) ||
            catLabel(e.cat).toLowerCase().includes(q)
          if (matches && (filterCat === 'all' || e.cat === filterCat)) hits.push({ key: k, e })
        })
      })
    return { mode: 'search' as const, hits: hits.slice(0, 50), q }
  }

  const byMonth: Record<string, DayGroup[]> = {}
  Object.keys(data).forEach((k) => {
    if (!(data[k] || []).length) return
    let items = data[k]
    if (filterCat !== 'all') items = items.filter((e) => e.cat === filterCat)
    if (!items.length) return
    const mk = k.slice(0, 7)
    if (!byMonth[mk]) byMonth[mk] = []
    byMonth[mk].push({ key: k, items, total: items.reduce((s, e) => s + e.amount, 0) })
  })
  const months: MonthGroup[] = Object.keys(byMonth)
    .sort((a, b) => b.localeCompare(a))
    .map((mk) => {
      const [y, m] = mk.split('-').map(Number)
      const days = byMonth[mk].sort((a, b) => b.key.localeCompare(a.key))
      return { mk, year: y, month: m, days, total: days.reduce((s, d) => s + d.total, 0) }
    })
  return { mode: 'groups' as const, months }
}
