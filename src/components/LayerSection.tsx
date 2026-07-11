import { useState } from 'react'
import type { Layer, Location } from '../types'
import { LocationCard } from './LocationCard'
import { LocationForm } from './LocationForm'
import { PlusIcon } from './icons'

interface LayerSectionProps {
  layer: Layer
  onAddLocation: (location: Omit<Location, 'id'>) => void
  onDeleteLocation: (locationId: string) => void
}

export function LayerSection({ layer, onAddLocation, onDeleteLocation }: LayerSectionProps) {
  const [adding, setAdding] = useState(false)

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-neutral-900">{layer.name}</h2>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 text-sm font-medium text-neutral-600 hover:text-neutral-900 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100"
        >
          <PlusIcon className="w-4 h-4" />
          Add location
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {layer.locations.map((location) => (
          <LocationCard key={location.id} location={location} onDelete={() => onDeleteLocation(location.id)} />
        ))}

        {adding && (
          <LocationForm
            onSubmit={(location) => {
              onAddLocation(location)
              setAdding(false)
            }}
            onCancel={() => setAdding(false)}
          />
        )}
      </div>

      {layer.locations.length === 0 && !adding && (
        <p className="text-sm text-neutral-400">No locations yet.</p>
      )}
    </section>
  )
}
