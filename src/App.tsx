import { useEffect, useMemo, useState } from 'react'
import type { LatLngTuple } from 'leaflet'
import { LayersPanel } from './components/LayersPanel'
import { MapView, type FlatLocation } from './components/MapView'
import { EditControls } from './components/EditControls'
import { LayerPickerPill } from './components/LayerPickerPill'
import { FabButton } from './components/FabButton'
import { PendingLocationCard } from './components/PendingLocationCard'
import { LocationEditCard } from './components/LocationEditCard'
import { LocationDetailCard } from './components/LocationDetailCard'
import { AddressSearchSheet } from './components/AddressSearchSheet'
import { LayersIcon } from './components/icons'
import { useLayers } from './lib/useLayers'
import type { GeocodeResult } from './lib/geocode'

function App() {
  const {
    layers,
    importedLayerName,
    clearImportedLayerName,
    createLayer,
    deleteLayer,
    renameLayer,
    toggleLayerVisibility,
    addLocation,
    updateLocation,
    deleteLocation,
  } = useLayers()

  const [panelOpen, setPanelOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null)
  const [pendingPoint, setPendingPoint] = useState<LatLngTuple | null>(null)
  const [pendingInitialName, setPendingInitialName] = useState<string | undefined>(undefined)
  const [editingItem, setEditingItem] = useState<FlatLocation | null>(null)
  const [selected, setSelected] = useState<FlatLocation | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)

  const visibleLayers = layers.filter((l) => l.visible)
  const ownedVisibleLayers = visibleLayers.filter((l) => l.owned)

  useEffect(() => {
    if (activeLayerId && ownedVisibleLayers.some((l) => l.id === activeLayerId)) return
    setActiveLayerId(ownedVisibleLayers[0]?.id ?? null)
  }, [activeLayerId, ownedVisibleLayers])

  const flatLocations = useMemo<FlatLocation[]>(
    () => visibleLayers.flatMap((layer) => layer.locations.map((location) => ({ location, layerId: layer.id }))),
    [visibleLayers],
  )

  const activeLayer = ownedVisibleLayers.find((l) => l.id === activeLayerId) ?? null
  const selectedLayer = selected ? layers.find((l) => l.id === selected.layerId) ?? null : null
  const editingLayer = editingItem ? layers.find((l) => l.id === editingItem.layerId) ?? null : null

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
    const layer = layers.find((l) => l.id === item.layerId)
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

  return (
    <div className="h-svh w-full relative overflow-hidden bg-neutral-100">
      <MapView
        locations={flatLocations}
        editMode={editMode}
        pendingPoint={pendingPoint}
        onMapClick={handleMapClick}
        onMarkerClick={handleMarkerClick}
      />

      <EditControls editMode={editMode} onToggleEdit={handleToggleEdit} onOpenSearch={() => setSearchOpen(true)} />

      <div className="absolute top-4 right-4 z-[500]">
        <FabButton onClick={() => setPanelOpen(true)} badge={layers.length} label="Your layers">
          <LayersIcon className="w-5 h-5" />
        </FabButton>
      </div>

      {editMode && (
        <LayerPickerPill
          ownedVisibleLayers={ownedVisibleLayers}
          activeLayerId={activeLayerId}
          onSelect={(id) => {
            setActiveLayerId(id)
            clearInteractions()
          }}
          onCreateLayer={createLayer}
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
            Tap the edit button, then create a layer to start dropping pins.
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
          layerName={editingLayer.name}
          onSave={(updates) => {
            updateLocation(editingItem.layerId, editingItem.location.id, updates)
            setEditingItem(null)
          }}
          onCancel={() => setEditingItem(null)}
          onDelete={() => {
            deleteLocation(editingItem.layerId, editingItem.location.id)
            setEditingItem(null)
          }}
        />
      )}

      {selected && selectedLayer && (
        <LocationDetailCard
          location={selected.location}
          layerName={selectedLayer.name}
          onClose={() => setSelected(null)}
          onDelete={() => {
            deleteLocation(selected.layerId, selected.location.id)
            setSelected(null)
          }}
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
        />
      )}
    </div>
  )
}

export default App
