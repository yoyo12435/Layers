import { useEffect, useMemo, useState } from 'react'
import type { LatLngBounds, LatLngTuple } from 'leaflet'
import type { User } from 'firebase/auth'
import { LayersPanel } from './components/LayersPanel'
import { MapView, type FlatLocation } from './components/MapView'
import { TopRightControls } from './components/TopRightControls'
import { LayerPickerPill } from './components/LayerPickerPill'
import { FabButton } from './components/FabButton'
import { LocateControl } from './components/LocateControl'
import { PendingLocationCard } from './components/PendingLocationCard'
import { LocationEditCard } from './components/LocationEditCard'
import { LocationDetailCard } from './components/LocationDetailCard'
import { AddressSearchSheet } from './components/AddressSearchSheet'
import { SettingsPanel } from './components/SettingsPanel'
import { SignInScreen } from './components/SignInScreen'
import { SharedLayerView } from './components/SharedLayerView'
import { LoadingScreen } from './components/LoadingScreen'
import { SettingsIcon } from './components/icons'
import { useAuth } from './lib/useAuth'
import { useCloudLayers } from './lib/useCloudLayers'
import { useNearbyLayer, NEARBY_LAYER_ID } from './lib/useNearbyLayer'
import { readSharedLayerFromUrl } from './lib/share'
import type { GeoPosition } from './lib/geolocation'
import type { GeocodeResult } from './lib/geocode'
import type { Layer } from './types'

interface MapAppProps {
  user: User
  onSignOut: () => void
}

function MapApp({ user, onSignOut }: MapAppProps) {
  const {
    layers,
    importedLayerName,
    clearImportedLayerName,
    createLayer,
    deleteLayer,
    renameLayer,
    toggleLayerVisibility,
    addLocation,
    deleteLocation,
    setLocationLayers,
    deleteLocationEverywhere,
  } = useCloudLayers(user.uid)

  const [panelOpen, setPanelOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null)
  const [pendingPoint, setPendingPoint] = useState<LatLngTuple | null>(null)
  const [pendingInitialName, setPendingInitialName] = useState<string | undefined>(undefined)
  const [editingItem, setEditingItem] = useState<FlatLocation | null>(null)
  const [selected, setSelected] = useState<FlatLocation | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<GeoPosition | null>(null)
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; zoom?: number; token: number } | null>(null)
  const [bounds, setBounds] = useState<LatLngBounds | null>(null)

  const { nearbyLayer, toggleNearbyVisible, loading: nearbyLoading, tooZoomedOut: nearbyTooZoomedOut } = useNearbyLayer(bounds)

  const visibleLayers = layers.filter((l) => l.visible)
  const ownedLayers = layers.filter((l) => l.owned)
  const ownedVisibleLayers = visibleLayers.filter((l) => l.owned)

  useEffect(() => {
    if (activeLayerId && ownedVisibleLayers.some((l) => l.id === activeLayerId)) return
    setActiveLayerId(ownedVisibleLayers[0]?.id ?? null)
  }, [activeLayerId, ownedVisibleLayers])

  const flatLocations = useMemo<FlatLocation[]>(() => {
    const accountLocations = visibleLayers.flatMap((layer) => layer.locations.map((location) => ({ location, layerId: layer.id })))
    const nearbyLocations = nearbyLayer.visible ? nearbyLayer.locations.map((location) => ({ location, layerId: NEARBY_LAYER_ID })) : []
    // A location can belong to several layers at once; render one pin per
    // unique location rather than a stacked duplicate per layer membership.
    const seen = new Set<string>()
    const deduped: FlatLocation[] = []
    for (const item of [...accountLocations, ...nearbyLocations]) {
      if (seen.has(item.location.id)) continue
      seen.add(item.location.id)
      deduped.push(item)
    }
    return deduped
  }, [visibleLayers, nearbyLayer])

  const findLayerById = (id: string): Layer | null => (id === NEARBY_LAYER_ID ? nearbyLayer : layers.find((l) => l.id === id) ?? null)

  const activeLayer = ownedVisibleLayers.find((l) => l.id === activeLayerId) ?? null
  const selectedLayer = selected ? findLayerById(selected.layerId) : null
  const editingLayer = editingItem ? findLayerById(editingItem.layerId) : null
  const editingLayerIds = editingItem
    ? ownedLayers.filter((l) => l.locations.some((loc) => loc.id === editingItem.location.id)).map((l) => l.id)
    : []

  const clearInteractions = () => {
    setPendingPoint(null)
    setPendingInitialName(undefined)
    setEditingItem(null)
    setSelected(null)
    setSearchOpen(false)
  }

  const handleToggleEdit = () => {
    setEditMode((v) => !v)
    clearInteractions()
  }

  const handleMapClick = (lat: number, lng: number) => {
    if (!editMode || !activeLayer || pendingPoint || editingItem) return
    setSelected(null)
    setPendingPoint([lat, lng])
    setPendingInitialName(undefined)
  }

  const handleMarkerClick = (item: FlatLocation) => {
    const layer = findLayerById(item.layerId)
    setPendingPoint(null)
    if (editMode && layer?.owned) {
      setSelected(null)
      setEditingItem(item)
    } else {
      setEditingItem(null)
      setSelected(item)
    }
  }

  const handleSearchSelect = (result: GeocodeResult) => {
    if (!activeLayer) return
    setSearchOpen(false)
    setSelected(null)
    setEditingItem(null)
    setPendingPoint([result.lat, result.lng])
    setPendingInitialName(result.shortName)
  }

  const handleLocated = (position: GeoPosition) => {
    setCurrentLocation(position)
    setFlyTo({ lat: position.lat, lng: position.lng, zoom: 16, token: Date.now() })
  }

  const handleCreateLayer = (name: string) => {
    const id = createLayer(name)
    setActiveLayerId(id)
    return id
  }

  return (
    <div className="h-svh w-full relative overflow-hidden bg-neutral-100">
      <MapView
        locations={flatLocations}
        editMode={editMode}
        pendingPoint={pendingPoint}
        currentLocation={currentLocation}
        flyTo={flyTo}
        onMapClick={handleMapClick}
        onMarkerClick={handleMarkerClick}
        onBoundsChange={setBounds}
      />

      <div className="absolute top-4 left-4 z-[500]">
        <FabButton onClick={() => setSettingsOpen(true)} label="Settings">
          <SettingsIcon className="w-5 h-5" />
        </FabButton>
      </div>

      <TopRightControls
        layerCount={layers.length}
        onOpenLayers={() => setPanelOpen(true)}
        editMode={editMode}
        onToggleEdit={handleToggleEdit}
        onOpenSearch={() => setSearchOpen(true)}
      />

      <LocateControl onLocated={handleLocated} />

      {editMode && (
        <LayerPickerPill
          ownedVisibleLayers={ownedVisibleLayers}
          activeLayerId={activeLayerId}
          onSelect={(id) => {
            setActiveLayerId(id)
            clearInteractions()
          }}
        />
      )}

      {importedLayerName && (
        <div className="absolute top-20 left-4 right-4 z-[600] flex justify-center">
          <div className="flex items-center gap-3 bg-white shadow-lg border border-green-200 text-green-800 text-sm rounded-full px-4 py-2 max-w-full">
            <span className="truncate">
              Added <strong>{importedLayerName}</strong> from a share link
            </span>
            <button onClick={clearImportedLayerName} className="text-green-700 hover:underline font-medium shrink-0">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {layers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-8">
          <p className="bg-white/95 border border-neutral-200 rounded-xl px-5 py-3 text-sm text-neutral-500 shadow-sm text-center">
            Open Layers (top right) to create your first layer, then tap Edit to start dropping pins.
          </p>
        </div>
      )}

      {pendingPoint && activeLayer && (
        <PendingLocationCard
          lat={pendingPoint[0]}
          lng={pendingPoint[1]}
          layerName={activeLayer.name}
          initialName={pendingInitialName}
          onSubmit={(location) => {
            addLocation(activeLayer.id, location)
            setPendingPoint(null)
            setPendingInitialName(undefined)
          }}
          onCancel={() => {
            setPendingPoint(null)
            setPendingInitialName(undefined)
          }}
        />
      )}

      {editingItem && editingLayer && (
        <LocationEditCard
          location={editingItem.location}
          ownedLayers={ownedLayers}
          initialLayerIds={editingLayerIds}
          onSave={(updates, layerIds) => {
            setLocationLayers(editingItem.location.id, { ...updates, lat: editingItem.location.lat, lng: editingItem.location.lng }, layerIds)
            setEditingItem(null)
          }}
          onCancel={() => setEditingItem(null)}
          onDelete={() => {
            deleteLocationEverywhere(editingItem.location.id)
            setEditingItem(null)
          }}
        />
      )}

      {selected && selectedLayer && (
        <LocationDetailCard
          location={selected.location}
          layerName={selectedLayer.name}
          onClose={() => setSelected(null)}
          onDelete={
            selected.layerId === NEARBY_LAYER_ID
              ? undefined
              : () => {
                  deleteLocation(selected.layerId, selected.location.id)
                  setSelected(null)
                }
          }
        />
      )}

      {searchOpen && (
        <AddressSearchSheet
          activeLayerName={activeLayer?.name ?? null}
          onSelect={handleSearchSelect}
          onClose={() => setSearchOpen(false)}
        />
      )}

      {panelOpen && (
        <LayersPanel
          layers={layers}
          onClose={() => setPanelOpen(false)}
          onToggleVisibility={toggleLayerVisibility}
          onDeleteLayer={deleteLayer}
          onRenameLayer={renameLayer}
          onCreateLayer={handleCreateLayer}
          pinnedLayer={nearbyLayer}
          onTogglePinnedVisible={toggleNearbyVisible}
          pinnedLoading={nearbyLoading}
          pinnedTooZoomedOut={nearbyTooZoomedOut}
        />
      )}

      {settingsOpen && (
        <SettingsPanel user={user} onSignOut={onSignOut} onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  )
}

function App() {
  const { user, loading, signInWithGoogle, continueWithEmail, signOut, configured, error } = useAuth()
  const [sharedPreview] = useState(() => readSharedLayerFromUrl())

  if (loading) return <LoadingScreen />
  if (!user) {
    if (sharedPreview) {
      return (
        <SharedLayerView
          layer={sharedPreview}
          configured={configured}
          error={error}
          onSignInWithGoogle={signInWithGoogle}
          onContinueWithEmail={continueWithEmail}
        />
      )
    }
    return (
      <SignInScreen
        configured={configured}
        error={error}
        onSignInWithGoogle={signInWithGoogle}
        onContinueWithEmail={continueWithEmail}
      />
    )
  }

  return <MapApp user={user} onSignOut={signOut} />
}

export default App
