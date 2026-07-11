import { LocationForm, type LocationDraft } from './LocationForm'
import type { Location } from '../types'

interface LocationEditCardProps {
  location: Location
  layerName: string
  onSave: (updates: LocationDraft) => void
  onCancel: () => void
  onDelete: () => void
}

export function LocationEditCard({ location, layerName, onSave, onCancel, onDelete }: LocationEditCardProps) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[500] w-[min(360px,calc(100vw-2rem))]">
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1.5 text-center">
        Editing pin in <span className="font-medium text-neutral-700 dark:text-neutral-200">{layerName}</span>
      </p>
      <LocationForm
        title="Edit location"
        submitLabel="Save changes"
        initial={location}
        onSubmit={onSave}
        onCancel={onCancel}
        onDelete={onDelete}
      />
    </div>
  )
}
