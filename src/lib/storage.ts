import type { Layer } from '../types'

const STORAGE_KEY = 'layers.app.layers'

export function loadLayers(): Layer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function saveLayers(layers: Layer[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layers))
}
