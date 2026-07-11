import type { Location } from '../types'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../types'
import { StarRating } from './StarRating'
import { CarIcon, TrashIcon, WalkIcon, XIcon } from './icons'
import { googleMapsWalkUrl, wazeDriveUrl } from '../lib/navigate'

interface LocationDetailCardProps {
  location: Location
  layerName: string
  onClose: () => void
  onDelete?: () => void
}

export function LocationDetailCard({ location, layerName, onClose, onDelete }: LocationDetailCardProps) {
  const color = CATEGORY_COLORS[location.category]

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[500] w-[min(380px,calc(100vw-2rem))]">
      <div className="relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 pl-5 shadow-xl">
        <span className="absolute left-0 top-4 bottom-4 w-1 rounded-full" style={{ backgroundColor: color }} />

        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-neutral-400 truncate">{layerName}</p>
            <h3 className="font-semibold text-lg text-neutral-900 dark:text-white leading-snug">{location.name}</h3>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onDelete && (
              <button onClick={onDelete} className="p-1.5 rounded-lg text-neutral-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600" aria-label={`Delete ${location.name}`}>
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800" aria-label="Close">
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {location.description && (
          <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">{location.description}</p>
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

        <div className="mt-3 flex items-center gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <a
            href={wazeDriveUrl(location.lat, location.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-white bg-[#33ccff] rounded-lg py-2 active:opacity-80"
          >
            <CarIcon className="w-4 h-4" />
            Drive
          </a>
          <a
            href={googleMapsWalkUrl(location.lat, location.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-white bg-[#4285f4] rounded-lg py-2 active:opacity-80"
          >
            <WalkIcon className="w-4 h-4" />
            Walk
          </a>
        </div>
      </div>
    </div>
  )
}
