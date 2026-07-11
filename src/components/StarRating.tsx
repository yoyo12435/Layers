import { StarIcon } from './icons'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
}

export function StarRating({ value, onChange }: StarRatingProps) {
  const interactive = Boolean(onChange)
  return (
    <div className="flex items-center gap-0.5" role={interactive ? 'radiogroup' : undefined} aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(n)}
          className={interactive ? 'cursor-pointer text-amber-400 hover:scale-110 transition-transform' : 'text-amber-400'}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <StarIcon className="w-4 h-4" filled={n <= value} />
        </button>
      ))}
    </div>
  )
}
