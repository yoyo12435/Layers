import { useState } from 'react'
import type { Layer } from '../types'
import { ChevronDownIcon, PlusIcon, XIcon } from './icons'

interface LayerPickerPillProps {
  ownedVisibleLayers: Layer[]
  activeLayerId: string | null
  onSelect: (layerId: string) => void
  onCreateLayer: (name: string) => string
}

export function LayerPickerPill({ ownedVisibleLayers, activeLayerId, onSelect, onCreateLayer }: LayerPickerPillProps) {
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  const activeLayer = ownedVisibleLayers.find((l) => l.id === activeLayerId) ?? null

  const submitCreate = () => {
    const trimmed = name.trim()
    if (trimmed) {
      const id = onCreateLayer(trimmed)
      onSelect(id)
    }
    setName('')
    setCreating(false)
    setOpen(false)
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

          {ownedVisibleLayers.length > 0 && <div className="border-t border-neutral-100" />}

          {creating ? (
            <div className="flex items-center gap-1.5 px-2.5 py-2">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitCreate()
                  if (e.key === 'Escape') setCreating(false)
                }}
                placeholder="Layer name"
                className="flex-1 min-w-0 border border-neutral-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-800"
              />
              <button onClick={submitCreate} className="bg-neutral-900 text-white text-xs font-medium rounded-lg px-2.5 py-1.5 shrink-0">
                Create
              </button>
              <button onClick={() => setCreating(false)} className="p-1 rounded text-neutral-400 shrink-0">
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="w-full flex items-center gap-1.5 text-left px-3.5 py-2.5 text-sm text-neutral-500 hover:bg-neutral-50"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              New layer
            </button>
          )}
        </div>
      )}
    </div>
  )
}
