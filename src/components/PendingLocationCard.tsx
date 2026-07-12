import { LocationForm } from './LocationForm'
import type { Location } from '../types'

interface PendingLocationCardProps {
  lat: number
  lng: number
  layerName: string
  initialName?: string
  onSubmit: (location: Omit<Location, 'id'>) => void
  onCancel: () => void
}

export function PendingLocationCard({ lat, lng, layerName, initialName, onSubmit, onCancel }: PendingLocationCardProps) {
  return (
    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[500] w-[min(360px,calc(100vw-2rem))] max-h-[calc(100%-7rem)] overflow-y-auto">
      <p className="text-xs text-neutral-500 mb-1.5 text-center">
        New pin in <span className="font-medium text-neutral-700">{layerName}</span> &middot; {lat.toFixed(4)}, {lng.toFixed(4)}
      </p>
      <LocationForm
        initial={initialName ? { name: initialName } : undefined}
        onSubmit={(location) => onSubmit({ ...location, lat, lng })}
        onCancel={onCancel}
      />
    </div>
  )
}
