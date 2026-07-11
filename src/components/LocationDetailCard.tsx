import type { Location } from '../types'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../types'
import { StarRating } from './StarRating'
import { TrashIcon, XIcon } from './icons'

interface LocationDetailCardProps {
  location: Location
  layerName: string
  onClose: () => void
  onDelete: () => void
}

export function LocationDetailCard({ location, layerName, onClose, onDelete }: LocationDetailCardProps) {
  const color = CATEGORY_COLORS[location.category]

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[500] w-[min(380px,calc(100vw-2rem))]">
      <div className="relative bg-white border border-neutral-200 rounded-xl p-4 pl-5 shadow-xl">
        <span className="absolute left-0 top-4 bottom-4 w-1 rounded-full" style={{ backgroundColor: color }} />

        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-neutral-400 truncate">{layerName}</p>
            <h3 className="font-semibold text-lg text-neutral-900 leading-snug">{location.name}</h3>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={onDelete} className="p-1.5 rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${location.name}`}>
              <TrashIcon className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100" aria-label="Close">
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {location.description && (
          <p className="mt-1.5 text-sm text-neutral-600 leading-relaxed">{location.description}</p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <StarRating value={location.rating} />
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ color, backgroundColor: `${color}1a`, border: `1px solid ${color}40` }}
          >
            {CATEGORY_LABELS[location.category]}
          </span>
        </div>
      </div>
    </div>
  )
}
