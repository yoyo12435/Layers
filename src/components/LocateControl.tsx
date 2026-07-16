import { useEffect, useState } from 'react'
import { FabButton } from './FabButton'
import { LocateIcon } from './icons'
import { geolocationErrorMessage, getCurrentPosition, locationPermissionSteps } from '../lib/geolocation'
import type { GeoPosition } from '../lib/geolocation'

interface LocateControlProps {
  onLocated: (position: GeoPosition) => void
  // Bumped by the parent on every map tap, so an old error/instructions
  // banner clears itself once the user moves on to interact with the map.
  mapClickSignal: number
}

export function LocateControl({ onLocated, mapClickSignal }: LocateControlProps) {
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    setError(null)
    setPermissionDenied(false)
    setShowHelp(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapClickSignal])

  const handleClick = async () => {
    setLocating(true)
    setError(null)
    setPermissionDenied(false)
    setShowHelp(false)
    try {
      const position = await getCurrentPosition()
      onLocated(position)
    } catch (err) {
      setError(geolocationErrorMessage(err))
      setPermissionDenied((err as GeolocationPositionError | undefined)?.code === 1)
    } finally {
      setLocating(false)
    }
  }

  return (
    <div className="absolute bottom-6 right-4 z-[500] flex flex-col items-end gap-2">
      {error && (
        <div className="bg-neutral-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg max-w-[260px] flex flex-col items-start gap-1.5">
          <span>{error}</span>
          {permissionDenied && (
            <button onClick={() => setShowHelp((v) => !v)} className="font-semibold underline underline-offset-2">
              How to allow location
            </button>
          )}
          {showHelp && (
            <ol className="list-decimal list-inside space-y-0.5 text-neutral-200">
              {locationPermissionSteps().map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          )}
        </div>
      )}
      <FabButton onClick={handleClick} label="Find my location" active={locating}>
        <LocateIcon className={`w-5 h-5 ${locating ? 'animate-spin' : ''}`} />
      </FabButton>
    </div>
  )
}
