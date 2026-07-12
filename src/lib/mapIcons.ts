import L from 'leaflet'
import { CATEGORY_COLORS, type Category } from '../types'

const cache = new Map<string, L.DivIcon>()

// Drawn on a 30x40 grid, then scaled up 10% at render time via iconSize.
const RENDER_SIZE: [number, number] = [33, 44]
const RENDER_ANCHOR: [number, number] = [16.5, 41.8]
const RENDER_POPUP_ANCHOR: [number, number] = [0, -35.2]

function pinSvg(color: string, outlined: boolean): string {
  const ring = outlined ? ' stroke="white" stroke-width="1.5"' : ''
  return `<svg width="${RENDER_SIZE[0]}" height="${RENDER_SIZE[1]}" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="15" cy="36" rx="5" ry="2.2" fill="rgba(15,15,15,0.35)" stroke="white" stroke-width="1.5"/>
    <polygon points="15,7 24,16 15,34 6,16" fill="${color}"${ring} stroke-linejoin="round"/>
    <polygon points="15,7 24,16 15,34" fill="black" fill-opacity="0.15"/>
    <polygon points="15,12 19,16 15,20 11,16" fill="white"/>
  </svg>`
}

export function categoryIcon(category: Category, outlined: boolean): L.DivIcon {
  const key = `${category}|${outlined}`
  const cached = cache.get(key)
  if (cached) return cached
  const icon = L.divIcon({
    className: 'layers-pin',
    html: pinSvg(CATEGORY_COLORS[category], outlined),
    iconSize: RENDER_SIZE,
    iconAnchor: RENDER_ANCHOR,
    popupAnchor: RENDER_POPUP_ANCHOR,
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
    iconSize: RENDER_SIZE,
    iconAnchor: RENDER_ANCHOR,
    popupAnchor: RENDER_POPUP_ANCHOR,
  })
  return nearbyIconCache
}

let pendingIconCache: L.DivIcon | null = null

export function pendingPinIcon(): L.DivIcon {
  if (pendingIconCache) return pendingIconCache
  pendingIconCache = L.divIcon({
    className: 'layers-pin layers-pin-pending',
    html: pinSvg('#6b7280', true),
    iconSize: RENDER_SIZE,
    iconAnchor: RENDER_ANCHOR,
    popupAnchor: RENDER_POPUP_ANCHOR,
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
