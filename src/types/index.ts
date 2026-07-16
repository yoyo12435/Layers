export type Category = 'park' | 'restaurant' | 'bar' | 'entertainment' | 'other'

export interface Location {
  id: string
  name: string
  description: string
  rating: number // 0-5, in half-star increments
  category: Category
  lat: number
  lng: number
}

export interface Layer {
  id: string
  name: string
  locations: Location[]
  visible: boolean
  owned: boolean
  pinned?: boolean
  archived?: boolean
  createdAt?: number
  updatedAt?: number
  shareId?: string
  sourceShareId?: string
}

export const CATEGORY_COLORS: Record<Category, string> = {
  park: '#22c55e',
  restaurant: '#3b82f6',
  bar: '#ec4899',
  entertainment: '#a855f7',
  other: '#171717',
}

export const CATEGORY_LABELS: Record<Category, string> = {
  park: 'Park',
  restaurant: 'Restaurant',
  bar: 'Bar',
  entertainment: 'Entertainment',
  other: 'Other',
}

export const CATEGORIES: Category[] = ['park', 'restaurant', 'bar', 'entertainment', 'other']
