import {
  Utensils,
  ShoppingBasket,
  Bus,
  Sparkles,
  Home,
  HeartPulse,
  ShoppingBag,
  FileText,
  Plane,
  Gift,
  Tag,
  type LucideIcon,
} from 'lucide-react'
import type { CatId } from './types'

export interface Category {
  id: CatId
  label: string
  Icon: LucideIcon
}

export const CATEGORIES: Category[] = [
  { id: 'food', label: 'Food', Icon: Utensils },
  { id: 'groceries', label: 'Groceries', Icon: ShoppingBasket },
  { id: 'transport', label: 'Transport', Icon: Bus },
  { id: 'fun', label: 'Fun', Icon: Sparkles },
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'health', label: 'Health', Icon: HeartPulse },
  { id: 'shop', label: 'Shopping', Icon: ShoppingBag },
  { id: 'bills', label: 'Bills', Icon: FileText },
  { id: 'travel', label: 'Travel', Icon: Plane },
  { id: 'gift', label: 'Gifts', Icon: Gift },
  { id: 'other', label: 'Other', Icon: Tag },
]

const FALLBACK = CATEGORIES[CATEGORIES.length - 1]

export const catById = (id: string): Category =>
  CATEGORIES.find((c) => c.id === id) || FALLBACK

export const catLabel = (id: string) => catById(id).label

export function CatIcon({
  id,
  size = 16,
  className,
  strokeWidth = 1.6,
}: {
  id: string
  size?: number
  className?: string
  strokeWidth?: number
}) {
  const C = catById(id).Icon
  return <C size={size} strokeWidth={strokeWidth} className={className} />
}
