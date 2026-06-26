export const pad = (n: number) => String(n).padStart(2, '0')

export const dateKey = (d = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const parseKey = (k: string) => {
  const [y, m, d] = k.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const monthKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
export const todayKey = () => dateKey()

export interface Currency {
  code: string
  symbol: string
  label: string
}

export const CURRENCIES: Currency[] = [
  { code: 'EUR', symbol: '€', label: '€ EUR' },
  { code: 'USD', symbol: '$', label: '$ USD' },
  { code: 'GBP', symbol: '£', label: '£ GBP' },
]

export const currencyByCode = (code: string) =>
  CURRENCIES.find((c) => c.code === code) || CURRENCIES[0]

export const makeFmt = (code: string) => {
  const sym = currencyByCode(code).symbol
  return (n: number) => sym + (Number(n) || 0).toFixed(2)
}

export const uid = () =>
  Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7)
