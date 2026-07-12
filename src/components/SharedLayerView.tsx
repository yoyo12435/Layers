import { useState } from 'react'
import { MapView, type FlatLocation } from './MapView'
import { LocationDetailCard } from './LocationDetailCard'
import { SignInScreen } from './SignInScreen'
import type { Layer } from '../types'

interface SharedLayerViewProps {
  layer: Layer
  configured: boolean
  error: string | null
  onSignInWithGoogle: () => void
  onContinueWithEmail: (email: string, password: string) => Promise<void>
}

export function SharedLayerView({ layer, configured, error, onSignInWithGoogle, onContinueWithEmail }: SharedLayerViewProps) {
  const [selected, setSelected] = useState<FlatLocation | null>(null)
  const [showSignIn, setShowSignIn] = useState(false)

  const flatLocations: FlatLocation[] = layer.locations.map((location) => ({ location, layerId: layer.id }))

  if (showSignIn) {
    return (
      <SignInScreen
        configured={configured}
        error={error}
        onSignInWithGoogle={onSignInWithGoogle}
        onContinueWithEmail={onContinueWithEmail}
      />
    )
  }

  return (
    <div className="h-svh w-full relative overflow-hidden bg-neutral-100">
      <MapView
        locations={flatLocations}
        editMode={false}
        pendingPoint={null}
        currentLocation={null}
        flyTo={null}
        onMapClick={() => {}}
        onMarkerClick={setSelected}
      />

      <div className="absolute top-4 left-4 right-4 z-[600] flex items-center gap-2">
        <div className="flex-1 min-w-0 bg-white shadow-lg border border-neutral-200 rounded-2xl px-4 py-2">
          <p className="text-sm font-medium text-neutral-900 truncate">{layer.name}</p>
          <p className="text-xs text-neutral-400">
            {layer.locations.length} location{layer.locations.length === 1 ? '' : 's'} shared with you
          </p>
        </div>
        <button
          onClick={() => setShowSignIn(true)}
          className="shrink-0 bg-neutral-900 text-white text-sm font-medium rounded-full px-4 py-2.5 shadow-lg active:opacity-80"
        >
          Sign in
        </button>
      </div>

      {selected && (
        <LocationDetailCard location={selected.location} layerName={layer.name} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
