import { useState } from 'react'
import { TopBar } from './components/TopBar'
import { LayersPanel } from './components/LayersPanel'
import { LayerSection } from './components/LayerSection'
import { NewLayerButton } from './components/NewLayerButton'
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

  const visibleLayers = layers.filter((l) => l.visible)

  return (
    <div className="min-h-svh bg-neutral-50">
      <TopBar layerCount={layers.length} onOpenLayers={() => setPanelOpen(true)} />

      {importedLayerName && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
          <div className="flex items-center justify-between bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg px-4 py-2.5">
            <span>
              Added layer <strong>{importedLayerName}</strong> from your share link.
            </span>
            <button onClick={clearImportedLayerName} className="text-green-700 hover:underline font-medium">
              Dismiss
            </button>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <NewLayerButton onCreate={createLayer} />

        {visibleLayers.length === 0 && (
          <p className="text-center text-neutral-400 text-sm py-16">
            {layers.length === 0
              ? 'Create your first layer to start adding locations.'
              : 'All your layers are hidden. Open Layers in the top right to show one.'}
          </p>
        )}

        {visibleLayers.map((layer) => (
          <LayerSection
            key={layer.id}
            layer={layer}
            onAddLocation={(location) => addLocation(layer.id, location)}
            onDeleteLocation={(locationId) => deleteLocation(layer.id, locationId)}
          />
        ))}
      </main>

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
