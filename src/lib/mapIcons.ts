import L from 'leaflet'
import { CATEGORY_COLORS, type Category } from '../types'

const cache = new Map<string, L.DivIcon>()

function pinSvg(color: string, outlined: boolean): string {
  const ring = outlined ? ' stroke="white" stroke-width="2.5"' : ''
  return `<svg width="30" height="36" viewBox="0 0 30 36" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="15" cy="28" rx="5" ry="2.2" fill="rgba(15,15,15,0.35)"${ring}/>
    <rect x="8" y="6" width="14" height="14" rx="3" fill="${color}"${ring} transform="rotate(45 15 13)"/>
  </svg>`
}

export function categoryIcon(category: Category, outlined: boolean): L.DivIcon {
  const key = `${category}|${outlined}`
  const cached = cache.get(key)
  if (cached) return cached
  const icon = L.divIcon({
    className: 'layers-pin',
    html: pinSvg(CATEGORY_COLORS[category], outlined),
    iconSize: [30, 36],
    iconAnchor: [15, 31],
    popupAnchor: [0, -28],
  })
  cache.set(key, icon)
  return icon
}

let nearbyIconCache: L.DivIcon | null = null

export function nearbyPinIcon(): L.DivIcon {
  if (nearbyIconCache) return nearbyIconCache
  nearbyIconCache = L.divIcon({
    className: 'layers-pin',
    html: pinSvg('#f97316', false),
    iconSize: [30, 36],
    iconAnchor: [15, 31],
    popupAnchor: [0, -28],
  })
  return nearbyIconCache
}

let pendingIconCache: L.DivIcon | null = null

export function pendingPinIcon(): L.DivIcon {
  if (pendingIconCache) return pendingIconCache
  pendingIconCache = L.divIcon({
    className: 'layers-pin layers-pin-pending',
    html: pinSvg('#6b7280', true),
    iconSize: [30, 36],
    iconAnchor: [15, 31],
    popupAnchor: [0, -28],
  })
  return pendingIconCache
}

let currentLocationIconCache: L.DivIcon | null = null

export function currentLocationIcon(): L.DivIcon {
  if (currentLocationIconCache) return currentLocationIconCache
  currentLocationIconCache = L.divIcon({
    className: 'layers-current-location',
    html: `<span class="layers-current-location-dot"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
  return currentLocationIconCache
}
