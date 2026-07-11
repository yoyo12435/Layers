import { useEffect, useMemo, useState } from 'react'
import type { LatLngTuple } from 'leaflet'
import { TopBar } from './components/TopBar'
import { LayersPanel } from './components/LayersPanel'
import { MapView, type FlatLocation } from './components/MapView'
import { MapControls } from './components/MapControls'
import { PendingLocationCard } from './components/PendingLocationCard'
import { LocationDetailCard } from './components/LocationDetailCard'
import { useLayers } from './lib/useLayers'

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
    deleteLocation,
  } = useLayers()

  const [panelOpen, setPanelOpen] = useState(false)
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null)
  const [placing, setPlacing] = useState(false)
  const [pendingPoint, setPendingPoint] = useState<LatLngTuple | null>(null)
  const [selected, setSelected] = useState<FlatLocation | null>(null)

  const visibleLayers = layers.filter((l) => l.visible)

  useEffect(() => {
    if (activeLayerId && visibleLayers.some((l) => l.id === activeLayerId)) return
    setActiveLayerId(visibleLayers[0]?.id ?? null)
  }, [activeLayerId, visibleLayers])

  const flatLocations = useMemo<FlatLocation[]>(
    () => visibleLayers.flatMap((layer) => layer.locations.map((location) => ({ location, layerId: layer.id }))),
    [visibleLayers],
  )

  const activeLayer = layers.find((l) => l.id === activeLayerId) ?? null
  const selectedLayer = selected ? layers.find((l) => l.id === selected.layerId) ?? null : null

  const handleMapClick = (lat: number, lng: number) => {
    if (!placing) return
    setSelected(null)
    setPendingPoint([lat, lng])
    setPlacing(false)
  }

  const handleMarkerClick = (item: FlatLocation) => {
    setPlacing(false)
    setPendingPoint(null)
    setSelected(item)
  }

  return (
    <div className="h-svh flex flex-col bg-neutral-50 overflow-hidden">
      <TopBar layerCount={layers.length} onOpenLayers={() => setPanelOpen(true)} />

      {importedLayerName && (
        <div className="px-4 sm:px-6 pt-3 z-[600]">
          <div className="flex items-center justify-between bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg px-4 py-2.5 max-w-xl mx-auto">
            <span>
              Added layer <strong>{importedLayerName}</strong> from your share link.
            </span>
            <button onClick={clearImportedLayerName} className="text-green-700 hover:underline font-medium">
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="relative flex-1 min-h-0">
        <MapView
          locations={flatLocations}
          placing={placing}
          pendingPoint={pendingPoint}
          onMapClick={handleMapClick}
          onMarkerClick={handleMarkerClick}
        />

        <MapControls
          layers={layers}
          activeLayerId={activeLayerId}
          onSelectActiveLayer={(id) => {
            setActiveLayerId(id)
            setPlacing(false)
            setPendingPoint(null)
          }}
          onCreateLayer={createLayer}
          placing={placing}
          onStartPlacing={() => {
            setSelected(null)
            setPlacing(true)
          }}
          onCancelPlacing={() => {
            setPlacing(false)
            setPendingPoint(null)
          }}
        />

        {layers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4">
            <p className="bg-white/90 border border-neutral-200 rounded-xl px-5 py-3 text-sm text-neutral-500 shadow-sm">
              Create your first layer to start dropping pins.
            </p>
          </div>
        )}

        {pendingPoint && activeLayer && (
          <PendingLocationCard
            lat={pendingPoint[0]}
            lng={pendingPoint[1]}
            layerName={activeLayer.name}
            onSubmit={(location) => {
              addLocation(activeLayer.id, location)
              setPendingPoint(null)
            }}
            onCancel={() => setPendingPoint(null)}
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
      </div>

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
