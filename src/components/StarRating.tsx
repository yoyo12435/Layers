import { useRef, useState } from 'react'
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
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const updateRatingFromEvent = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current || !onChange) return
    const rect = containerRef.current.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const x = clientX - rect.left
    const rating = Math.max(0, Math.min(5, Math.round((x / rect.width) * 10) / 2))
    onChange(rating)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return
    setIsDragging(true)
    updateRatingFromEvent(e)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!interactive) return
    setIsDragging(true)
    updateRatingFromEvent(e)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && interactive) updateRatingFromEvent(e)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && interactive) updateRatingFromEvent(e)
  }

  const handleMouseUp = () => setIsDragging(false)
  const handleTouchEnd = () => setIsDragging(false)

  return (
    <div
      ref={containerRef}
      className={`flex items-center gap-3 ${interactive ? 'select-none' : ''}`}
      role={interactive ? 'radiogroup' : undefined}
      aria-label="Rating"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleTouchEnd}
      onMouseLeave={handleMouseUp}
      style={interactive ? { cursor: 'pointer' } : undefined}
    >
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
          </span>
        )
      })}
    </div>
  )
}
