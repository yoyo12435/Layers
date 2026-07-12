import { useState } from 'react'
import type { Layer } from '../types'
import { ChevronDownIcon } from './icons'

interface LayerPickerPillProps {
  ownedVisibleLayers: Layer[]
  activeLayerId: string | null
  onSelect: (layerId: string) => void
}

export function LayerPickerPill({ ownedVisibleLayers, activeLayerId, onSelect }: LayerPickerPillProps) {
  const [open, setOpen] = useState(false)

  const activeLayer = ownedVisibleLayers.find((l) => l.id === activeLayerId) ?? null

  if (ownedVisibleLayers.length === 0) {
    return (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] max-w-[calc(100vw-136px)]">
        <div className="bg-white shadow-lg border border-neutral-200 rounded-full px-4 py-2 text-sm text-neutral-500 max-w-full truncate">
          Create a layer from Layers to start
        </div>
      </div>
    )
  }

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] flex flex-col items-center max-w-[calc(100vw-136px)]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 bg-white shadow-lg border border-neutral-200 rounded-full pl-3 pr-2.5 py-2 text-sm font-medium text-neutral-800 max-w-full"
      >
        <span className="truncate">{activeLayer ? activeLayer.name : 'Choose a layer'}</span>
        <ChevronDownIcon className="w-4 h-4 shrink-0 text-neutral-400" />
      </button>

      {open && (
        <div className="mt-1.5 w-56 max-w-[calc(100vw-32px)] bg-white shadow-xl border border-neutral-200 rounded-xl overflow-hidden">
          {ownedVisibleLayers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => {
                onSelect(layer.id)
                setOpen(false)
              }}
              className={`w-full text-left px-3.5 py-2.5 text-sm truncate hover:bg-neutral-50 ${
                layer.id === activeLayerId ? 'font-semibold text-neutral-900' : 'text-neutral-600'
              }`}
            >
              {layer.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
