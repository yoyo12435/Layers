import { useState } from 'react'
import { FabButton } from './FabButton'
import { LocateIcon } from './icons'
import { geolocationErrorMessage, getCurrentPosition } from '../lib/geolocation'
import type { GeoPosition } from '../lib/geolocation'

interface LocateControlProps {
  onLocated: (position: GeoPosition) => void
  onOpenSettings: () => void
}

export function LocateControl({ onLocated, onOpenSettings }: LocateControlProps) {
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)

  const handleClick = async () => {
    setLocating(true)
    setError(null)
    setPermissionDenied(false)
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
            <button onClick={onOpenSettings} className="font-semibold underline underline-offset-2">
              Open Settings
            </button>
          )}
        </div>
      )}
      <FabButton onClick={handleClick} label="Find my location" active={locating}>
        <LocateIcon className={`w-5 h-5 ${locating ? 'animate-spin' : ''}`} />
      </FabButton>
    </div>
  )
}
