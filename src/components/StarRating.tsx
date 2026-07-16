import { StarIcon } from './icons'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  size?: string
}

// A star is empty, half, or full depending on how far `value` reaches into
// its slot (n-1 to n). The filled icon is clipped to the left 50% for a
// half-star instead of being resized, so it never looks squished.
function starFill(value: number, n: number): 'empty' | 'half' | 'full' {
  if (value >= n) return 'full'
  if (value >= n - 0.5) return 'half'
  return 'empty'
}

export function StarRating({ value, onChange, size = 'w-10 h-10' }: StarRatingProps) {
  const interactive = Boolean(onChange)
  return (
    <div className="flex items-center gap-1" role={interactive ? 'radiogroup' : undefined} aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = starFill(value, n)
        return (
          <span key={n} className={`relative shrink-0 ${size} text-amber-400`}>
            <StarIcon className="absolute inset-0 w-full h-full" filled={false} />
            {fill !== 'empty' && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={fill === 'half' ? { clipPath: 'inset(0 50% 0 0)' } : undefined}
              >
                <StarIcon className="w-full h-full" filled />
              </span>
            )}
            {interactive && (
              <>
                <button
                  type="button"
                  onClick={() => onChange?.(n - 0.5)}
                  className="absolute inset-y-0 left-0 w-1/2 cursor-pointer"
                  aria-label={`${n - 0.5} stars`}
                />
                <button
                  type="button"
                  onClick={() => onChange?.(n)}
                  className="absolute inset-y-0 right-0 w-1/2 cursor-pointer"
                  aria-label={`${n} stars`}
                />
              </>
            )}
          </span>
        )
      })}
    </div>
  )
}
