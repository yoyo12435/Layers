import { useState } from 'react'
import type { Layer } from '../types'
import { PlusIcon, XIcon } from './icons'

interface MapControlsProps {
  layers: Layer[]
  activeLayerId: string | null
  onSelectActiveLayer: (layerId: string) => void
  onCreateLayer: (name: string) => string
  placing: boolean
  onStartPlacing: () => void
  onCancelPlacing: () => void
}

export function MapControls({
  layers,
  activeLayerId,
  onSelectActiveLayer,
  onCreateLayer,
  placing,
  onStartPlacing,
  onCancelPlacing,
}: MapControlsProps) {
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  const visibleLayers = layers.filter((l) => l.visible)

  const submitCreate = () => {
    const trimmed = name.trim()
    if (trimmed) {
      const id = onCreateLayer(trimmed)
      onSelectActiveLayer(id)
    }
    setName('')
    setCreating(false)
  }

  return (
    <div className="absolute top-4 left-4 z-[500] flex flex-col gap-2 max-w-[calc(100%-2rem)]">
      <div className="bg-white shadow-lg rounded-xl border border-neutral-200 p-2 flex items-center gap-2 flex-wrap">
        {creating ? (
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitCreate()
                if (e.key === 'Escape') setCreating(false)
              }}
              placeholder="Layer name"
              className="border border-neutral-300 rounded-lg px-2.5 py-1.5 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-neutral-800"
            />
            <button onClick={submitCreate} className="bg-neutral-900 text-white text-sm font-medium rounded-lg px-3 py-1.5 hover:bg-neutral-700">
              Create
            </button>
            <button onClick={() => setCreating(false)} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100">
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {visibleLayers.length > 0 && (
              <select
                value={activeLayerId ?? ''}
                onChange={(e) => onSelectActiveLayer(e.target.value)}
                className="border border-neutral-300 rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-800"
              >
                {visibleLayers.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-1 text-sm font-medium text-neutral-600 hover:text-neutral-900 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100"
            >
              <PlusIcon className="w-4 h-4" />
              New layer
            </button>

            {activeLayerId && (
              <button
                onClick={placing ? onCancelPlacing : onStartPlacing}
                className={`flex items-center gap-1 text-sm font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                  placing ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-neutral-900 text-white hover:bg-neutral-700'
                }`}
              >
                {placing ? (
                  <>
                    <XIcon className="w-4 h-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4" />
                    Add location
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>

      {placing && (
        <div className="bg-neutral-900 text-white text-sm rounded-lg px-3 py-2 shadow-lg self-start">
          Tap the map to drop a pin
        </div>
      )}
    </div>
  )
}
