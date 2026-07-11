export type Category = 'park' | 'restaurant' | 'entertainment' | 'other'

export interface Location {
  id: string
  name: string
  description: string
  rating: number // 1-5
  category: Category
  lat: number
  lng: number
}

export interface Layer {
  id: string
  name: string
  locations: Location[]
  visible: boolean
}

export const CATEGORY_COLORS: Record<Category, string> = {
  park: '#22c55e',
  restaurant: '#3b82f6',
  entertainment: '#a855f7',
  other: '#171717',
}

export const CATEGORY_LABELS: Record<Category, string> = {
  park: 'Park',
  restaurant: 'Restaurant',
  entertainment: 'Entertainment',
  other: 'Other',
}

export const CATEGORIES: Category[] = ['park', 'restaurant', 'entertainment', 'other']
