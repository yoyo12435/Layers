import L from 'leaflet'
import { CATEGORY_COLORS, type Category } from '../types'

const cache = new Map<string, L.DivIcon>()

function pinSvg(color: string, ringColor: string): string {
  return `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 0C6.72 0 0 6.72 0 15c0 11.25 15 25 15 25s15-13.75 15-25C30 6.72 23.28 0 15 0z" fill="${color}" stroke="${ringColor}" stroke-width="2"/>
    <circle cx="15" cy="15" r="5.5" fill="white"/>
  </svg>`
}

export function categoryIcon(category: Category): L.DivIcon {
  const cached = cache.get(category)
  if (cached) return cached
  const icon = L.divIcon({
    className: 'layers-pin',
    html: pinSvg(CATEGORY_COLORS[category], 'white'),
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -36],
  })
  cache.set(category, icon)
  return icon
}

let pendingIconCache: L.DivIcon | null = null

export function pendingPinIcon(): L.DivIcon {
  if (pendingIconCache) return pendingIconCache
  pendingIconCache = L.divIcon({
    className: 'layers-pin layers-pin-pending',
    html: pinSvg('#6b7280', '#111827'),
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -36],
  })
  return pendingIconCache
}
