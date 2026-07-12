import type { Layer } from '../types'

// Pinned layers first, everything else alphabetical by name.
export function sortLayers(list: Layer[]): Layer[] {
  return [...list].sort((a, b) => {
    if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}
