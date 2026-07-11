import type { Location } from '../types'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../types'
import { StarRating } from './StarRating'
import { TrashIcon } from './icons'

interface LocationCardProps {
  location: Location
  onDelete?: () => void
}

export function LocationCard({ location, onDelete }: LocationCardProps) {
  const color = CATEGORY_COLORS[location.category]
  return (
    <div className="relative bg-white border border-neutral-200 rounded-xl p-4 pl-5 shadow-sm hover:shadow-md transition-shadow">
      <span className="absolute left-0 top-4 bottom-4 w-1 rounded-full" style={{ backgroundColor: color }} />

      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-neutral-900 leading-snug">{location.name}</h3>
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1 rounded text-neutral-400 hover:bg-red-50 hover:text-red-600 shrink-0"
            aria-label={`Delete ${location.name}`}
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {location.description && (
        <p className="mt-1 text-sm text-neutral-500 leading-relaxed">{location.description}</p>
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
  )
}
