import type { Layer } from '../types'

export type SortMode = 'alpha' | 'recent-changed' | 'recent-added'

type Script = 'english' | 'hebrew' | 'number' | 'other'

const SCRIPT_ORDER: Record<Script, number> = { english: 0, hebrew: 1, number: 2, other: 3 }

function classify(name: string): Script {
  const firstMeaningfulChar = [...name.trim()].find((ch) => /[a-zA-Z0-9֐-׿]/.test(ch))
  if (!firstMeaningfulChar) return 'other'
  if (/[0-9]/.test(firstMeaningfulChar)) return 'number'
  if (/[֐-׿]/.test(firstMeaningfulChar)) return 'hebrew'
  return 'english'
}

// Groups names by script — English, then Hebrew, then numbers — before
// comparing within a group, so mixed-script layer lists sort predictably
// instead of by raw code point. Numbers compare numerically (2 before 10),
// not lexicographically.
function compareNames(a: string, b: string): number {
  const scriptA = classify(a)
  const scriptB = classify(b)
  if (scriptA !== scriptB) return SCRIPT_ORDER[scriptA] - SCRIPT_ORDER[scriptB]
  if (scriptA === 'number') return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  if (scriptA === 'hebrew') return a.localeCompare(b, 'he')
  if (scriptA === 'english') return a.localeCompare(b, 'en', { sensitivity: 'base' })
  return a.localeCompare(b)
}

// Pinned layers always float to the top; within each group, order by the
// chosen mode (alphabetical by default).
export function sortLayers(list: Layer[], mode: SortMode = 'alpha'): Layer[] {
  return [...list].sort((a, b) => {
    if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1
    if (mode === 'recent-changed') return (b.updatedAt ?? b.createdAt ?? 0) - (a.updatedAt ?? a.createdAt ?? 0)
    if (mode === 'recent-added') return (b.createdAt ?? 0) - (a.createdAt ?? 0)
    return compareNames(a.name, b.name)
  })
}
