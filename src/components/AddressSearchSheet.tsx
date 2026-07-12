import { useEffect, useRef, useState } from 'react'
import type { GeocodeResult } from '../lib/geocode'
import { searchPlaces } from '../lib/geocode'
import { geolocationErrorMessage, getCurrentPosition } from '../lib/geolocation'
import { LocateIcon, SearchIcon, XIcon } from './icons'

interface AddressSearchSheetProps {
  activeLayerName: string | null
  onSelect: (result: GeocodeResult) => void
  onClose: () => void
}

export function AddressSearchSheet({ activeLayerName, onSelect, onClose }: AddressSearchSheetProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [locating, setLocating] = useState(false)
  const [locateError, setLocateError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const trimmed = query.trim()
    abortRef.current?.abort()
    if (trimmed.length < 3) {
      setResults([])
      setStatus('idle')
      return
    }
    const controller = new AbortController()
    abortRef.current = controller
    setStatus('loading')
    const timer = setTimeout(() => {
      searchPlaces(trimmed, controller.signal)
        .then((r) => {
          setResults(r)
          setStatus('idle')
        })
        .catch((err) => {
          if (err.name === 'AbortError') return
          setStatus('error')
        })
    }, 400)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  const handleUseCurrentLocation = async () => {
    setLocating(true)
    setLocateError(null)
    try {
      const pos = await getCurrentPosition()
      onSelect({ displayName: 'Your current location', shortName: 'Current location', lat: pos.lat, lng: pos.lng })
    } catch (err) {
      setLocateError(geolocationErrorMessage(err))
    } finally {
      setLocating(false)
    }
  }

  return (
    <div className="absolute inset-0 z-[700] flex flex-col items-center pt-20 px-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="text-base font-semibold text-neutral-900">Add by address or name</h2>
          <button onClick={onClose} className="p-1.5 rounded-full text-neutral-400 hover:bg-neutral-100" aria-label="Close">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {activeLayerName === null ? (
          <p className="px-4 pb-6 text-sm text-neutral-500">
            Create or pick a layer at the top of the map first, then come back to add a pin by address or name.
          </p>
        ) : (
          <>
            <p className="px-4 pb-2 text-xs text-neutral-400">
              Adding to <span className="font-medium text-neutral-600">{activeLayerName}</span>
            </p>

            <div className="px-4 pb-3">
              <button
                onClick={handleUseCurrentLocation}
                disabled={locating}
                className="w-full flex items-center gap-2.5 border border-neutral-200 rounded-xl px-3 py-2.5 mb-2 text-sm font-medium text-blue-600 hover:bg-neutral-50"
              >
                <LocateIcon className={`w-4 h-4 shrink-0 ${locating ? 'animate-spin' : ''}`} />
                {locating ? 'Finding your location…' : 'Use current location'}
              </button>
              {locateError && <p className="text-xs text-red-500 mb-2">{locateError}</p>}

              <div className="flex items-center gap-2 border border-neutral-300 rounded-xl px-3 py-2.5">
                <SearchIcon className="w-4 h-4 text-neutral-400 shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search address or place name"
                  className="flex-1 min-w-0 text-sm bg-transparent text-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-6">
              {status === 'loading' && <p className="px-4 py-3 text-sm text-neutral-400">Searching…</p>}
              {status === 'error' && <p className="px-4 py-3 text-sm text-red-500">Couldn't search right now. Try again.</p>}
              {status === 'idle' && query.trim().length >= 3 && results.length === 0 && (
                <p className="px-4 py-3 text-sm text-neutral-400">No results.</p>
              )}

              <ul className="divide-y divide-neutral-100">
                {results.map((r, i) => (
                  <li key={i}>
                    <button
                      onClick={() => onSelect(r)}
                      className="w-full text-left px-4 py-3 hover:bg-neutral-50"
                    >
                      <p className="text-sm font-medium text-neutral-900 truncate">{r.shortName}</p>
                      <p className="text-xs text-neutral-400 truncate">{r.displayName}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
