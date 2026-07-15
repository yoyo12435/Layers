import { useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import { XIcon, LocateIcon } from './icons'
import { getCurrentPosition } from '../lib/geolocation'

interface SettingsPanelProps {
  user: User | null
  onSignOut: () => void
  onClose: () => void
}

type LocationStatus = 'unknown' | 'checking' | 'granted' | 'denied' | 'prompt'

export function SettingsPanel({ user, onSignOut, onClose }: SettingsPanelProps) {
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('unknown')

  useEffect(() => {
    const nav = navigator as Navigator & { permissions?: { query: (opts: { name: string }) => Promise<PermissionStatus> } }
    if (!nav.permissions?.query) return
    let status: PermissionStatus | null = null
    nav.permissions
      .query({ name: 'geolocation' })
      .then((result) => {
        status = result
        setLocationStatus(result.state as LocationStatus)
        result.onchange = () => setLocationStatus(result.state as LocationStatus)
      })
      .catch(() => {})
    return () => {
      if (status) status.onchange = null
    }
  }, [])

  const handleRequestLocation = async () => {
    setLocationStatus('checking')
    try {
      await getCurrentPosition()
      setLocationStatus('granted')
    } catch {
      setLocationStatus('denied')
    }
  }

  return (
    <div className="fixed inset-0 z-[800]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col layers-panel-in-left">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">Settings</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500" aria-label="Close">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {user && (
            <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-neutral-200" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">{user.displayName ?? 'Signed in'}</p>
                <p className="text-xs text-neutral-400 truncate">{user.email}</p>
              </div>
            </div>
          )}

          <div className="px-5 py-4 border-b border-neutral-100">
            <p className="text-sm font-medium text-neutral-900 mb-1.5">Location access</p>
            {locationStatus === 'granted' && <p className="text-xs text-green-700">Allowed — "Find my location" can work.</p>}
            {locationStatus === 'denied' && (
              <p className="text-xs text-red-600 mb-2">
                Blocked. Enable location for this site in your browser or phone's site settings, then try again.
              </p>
            )}
            {(locationStatus === 'prompt' || locationStatus === 'unknown') && (
              <p className="text-xs text-neutral-400 mb-2">Not yet allowed. Grant access to use "Find my location".</p>
            )}
            {locationStatus !== 'granted' && (
              <button
                onClick={handleRequestLocation}
                disabled={locationStatus === 'checking'}
                className="flex items-center gap-2 text-sm font-medium text-neutral-800 border border-neutral-300 rounded-lg px-3 py-2 hover:bg-neutral-50 disabled:opacity-60"
              >
                <LocateIcon className={`w-4 h-4 ${locationStatus === 'checking' ? 'animate-spin' : ''}`} />
                {locationStatus === 'checking' ? 'Checking…' : 'Allow location access'}
              </button>
            )}
          </div>

          <div className="px-5 py-4">
            <button
              onClick={onSignOut}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
