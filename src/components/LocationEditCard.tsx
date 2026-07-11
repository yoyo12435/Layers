import { useState } from 'react'
import { LocationForm, type LocationDraft } from './LocationForm'
import type { Layer, Location } from '../types'

interface LocationEditCardProps {
  location: Location
  layerId: string
  ownedLayers: Layer[]
  onSave: (updates: LocationDraft, targetLayerId: string) => void
  onCancel: () => void
  onDelete: () => void
}

export function LocationEditCard({ location, layerId, ownedLayers, onSave, onCancel, onDelete }: LocationEditCardProps) {
  const [targetLayerId, setTargetLayerId] = useState(layerId)
  const currentLayer = ownedLayers.find((l) => l.id === layerId)

  return (
    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[500] w-[min(360px,calc(100vw-2rem))] max-h-[calc(100%-7rem)] overflow-y-auto">
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1.5 text-center">
        Editing pin in <span className="font-medium text-neutral-700 dark:text-neutral-200">{currentLayer?.name ?? 'this layer'}</span>
      </p>

      {ownedLayers.length > 1 && (
        <div className="mb-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 shrink-0">Move to layer</span>
          <select
            value={targetLayerId}
            onChange={(e) => setTargetLayerId(e.target.value)}
            className="flex-1 min-w-0 text-sm text-right bg-transparent text-neutral-900 dark:text-white focus:outline-none"
          >
            {ownedLayers.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <LocationForm
        title="Edit location"
        submitLabel="Save changes"
        initial={location}
        onSubmit={(updates) => onSave(updates, targetLayerId)}
        onCancel={onCancel}
        onDelete={onDelete}
      />
    </div>
  )
}
