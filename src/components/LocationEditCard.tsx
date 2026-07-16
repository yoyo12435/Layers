import { useState } from 'react'
import { LocationForm, type LocationDraft } from './LocationForm'
import type { Layer, Location } from '../types'
import { CheckIcon } from './icons'

interface LocationEditCardProps {
  location: Location
  ownedLayers: Layer[]
  initialLayerIds: string[]
  onSave: (updates: LocationDraft, layerIds: string[]) => void
  onCancel: () => void
  onDelete: () => void
}

export function LocationEditCard({ location, ownedLayers, initialLayerIds, onSave, onCancel, onDelete }: LocationEditCardProps) {
  const [layerIds, setLayerIds] = useState<string[]>(initialLayerIds)
  const [showLayerPicker, setShowLayerPicker] = useState(false)

  const toggleLayer = (id: string) => {
    setLayerIds((prev) => (prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]))
  }

  return (
    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[500] w-[min(360px,calc(100vw-2rem))] max-h-[calc(100%-7rem)] overflow-y-auto">
      {ownedLayers.length > 1 && (
        <div className="mb-2 bg-white border border-neutral-200 rounded-xl px-3.5 py-3">
          {!showLayerPicker ? (
            <button
              type="button"
              onClick={() => setShowLayerPicker(true)}
              className="text-xs font-medium text-neutral-600 hover:underline"
            >
              Change layer
            </button>
          ) : (
            <>
              <p className="text-xs font-medium text-neutral-500 mb-2">In layers</p>
              <div className="flex flex-wrap gap-1.5">
                {ownedLayers.map((l) => {
                  const active = layerIds.includes(l.id)
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => toggleLayer(l.id)}
                      className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-full border transition-colors ${
                        active
                          ? 'bg-neutral-900 border-neutral-900 text-white'
                          : 'bg-white border-neutral-300 text-neutral-500'
                      }`}
                    >
                      {active && <CheckIcon className="w-3 h-3" />}
                      {l.name}
                    </button>
                  )
                })}
              </div>
              {layerIds.length === 0 && (
                <p className="text-xs text-red-500 mt-1.5">Pick at least one layer, or use delete instead.</p>
              )}
            </>
          )}
        </div>
      )}

      <LocationForm
        title="Edit location"
        submitLabel="Save changes"
        initial={location}
        onSubmit={(updates) => onSave(updates, layerIds)}
        onCancel={onCancel}
        onDelete={onDelete}
      />
    </div>
  )
}
