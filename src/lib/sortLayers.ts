import type { Layer } from '../types'

export type SortMode = 'alpha' | 'recent-changed' | 'recent-added'

// Pinned layers always float to the top; within each group, order by the
// chosen mode (alphabetical by default).
export function sortLayers(list: Layer[], mode: SortMode = 'alpha'): Layer[] {
  return [...list].sort((a, b) => {
    if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1
    if (mode === 'recent-changed') return (b.updatedAt ?? b.createdAt ?? 0) - (a.updatedAt ?? a.createdAt ?? 0)
    if (mode === 'recent-added') return (b.createdAt ?? 0) - (a.createdAt ?? 0)
    return a.name.localeCompare(b.name)
  })
}
