import { useState } from 'react'
import type { Layer } from '../types'
import { EyeIcon, EyeOffIcon, ShareIcon, TrashIcon, XIcon, CheckIcon, PinIcon, PlusIcon } from './icons'
import { buildShareUrl } from '../lib/share'

interface LayersPanelProps {
  layers: Layer[]
  onClose: () => void
  onToggleVisibility: (layerId: string) => void
  onDeleteLayer: (layerId: string) => void
  onRenameLayer: (layerId: string, name: string) => void
  onCreateLayer: (name: string) => string
  pinnedLayer: Layer
  onTogglePinnedVisible: () => void
  pinnedLoading: boolean
  pinnedTooZoomedOut: boolean
}

export function LayersPanel({
  layers,
  onClose,
  onToggleVisibility,
  onDeleteLayer,
  onRenameLayer,
  onCreateLayer,
  pinnedLayer,
  onTogglePinnedVisible,
  pinnedLoading,
  pinnedTooZoomedOut,
}: LayersPanelProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [creatingLayer, setCreatingLayer] = useState(false)
  const [newLayerName, setNewLayerName] = useState('')

  const submitCreateLayer = () => {
    const trimmed = newLayerName.trim()
    if (trimmed) onCreateLayer(trimmed)
    setNewLayerName('')
    setCreatingLayer(false)
  }

  const handleShare = async (layer: Layer) => {
    const url = buildShareUrl(layer)
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      window.prompt('Copy this share link:', url)
    }
    setCopiedId(layer.id)
    setTimeout(() => setCopiedId((id) => (id === layer.id ? null : id)), 1800)
  }

  const startRename = (layer: Layer) => {
    setRenamingId(layer.id)
    setRenameValue(layer.name)
  }

  const commitRename = (layerId: string) => {
    const trimmed = renameValue.trim()
    if (trimmed) onRenameLayer(layerId, trimmed)
    setRenamingId(null)
  }

  return (
    <div className="fixed inset-0 z-[800]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-neutral-900 shadow-2xl flex flex-col layers-panel-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Your Layers</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400" aria-label="Close">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-neutral-200 dark:border-neutral-800">
          {creatingLayer ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                value={newLayerName}
                onChange={(e) => setNewLayerName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitCreateLayer()
                  if (e.key === 'Escape') setCreatingLayer(false)
                }}
                placeholder="Layer name"
                className="flex-1 min-w-0 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-800 dark:focus:ring-neutral-400"
              />
              <button onClick={submitCreateLayer} className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium rounded-lg px-3 py-2 shrink-0">
                Create
              </button>
              <button onClick={() => setCreatingLayer(false)} className="p-2 rounded-lg text-neutral-400 shrink-0">
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCreatingLayer(true)}
              className="w-full flex items-center justify-center gap-1.5 text-sm font-medium border border-dashed border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-500 rounded-xl px-4 py-2.5"
            >
              <PlusIcon className="w-4 h-4" />
              New layer
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
            <li className="px-5 py-3 flex items-center gap-3 bg-neutral-50 dark:bg-neutral-800/50">
              <button
                onClick={onTogglePinnedVisible}
                className={`p-1.5 rounded-full shrink-0 transition-colors ${pinnedLayer.visible ? 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800' : 'text-neutral-300 dark:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                aria-label={pinnedLayer.visible ? `Hide ${pinnedLayer.name}` : `Show ${pinnedLayer.name}`}
                title={pinnedLayer.visible ? 'Visible — tap to hide' : 'Hidden — tap to show'}
              >
                {pinnedLayer.visible ? <EyeIcon className="w-5 h-5" /> : <EyeOffIcon className="w-5 h-5" />}
              </button>

              <div className="flex-1 min-w-0">
                <span className="flex items-center gap-1.5 min-w-0">
                  <PinIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className={`text-sm font-medium truncate ${pinnedLayer.visible ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>
                    {pinnedLayer.name}
                  </span>
                </span>
                <span className="text-xs text-neutral-400">
                  {pinnedTooZoomedOut
                    ? 'Zoom in on the map to load nearby places'
                    : pinnedLoading
                      ? 'Loading nearby places…'
                      : `${pinnedLayer.locations.length} found nearby`}
                </span>
              </div>
            </li>

            {layers.length === 0 && (
              <p className="px-5 py-8 text-center text-neutral-400 text-sm">
                No layers yet. Create one to get started, or open a share link.
              </p>
            )}

            {layers.map((layer) => (
              <li key={layer.id} className="px-5 py-3 flex items-center gap-3">
                <button
                  onClick={() => onToggleVisibility(layer.id)}
                  className={`p-1.5 rounded-full shrink-0 transition-colors ${layer.visible ? 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800' : 'text-neutral-300 dark:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                  aria-label={layer.visible ? `Hide ${layer.name}` : `Show ${layer.name}`}
                  title={layer.visible ? 'Visible — click to hide' : 'Hidden — click to show'}
                >
                  {layer.visible ? <EyeIcon className="w-5 h-5" /> : <EyeOffIcon className="w-5 h-5" />}
                </button>

                <div className="flex-1 min-w-0">
                  {renamingId === layer.id ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => commitRename(layer.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename(layer.id)
                        if (e.key === 'Escape') setRenamingId(null)
                      }}
                      className="w-full border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white rounded px-2 py-1 text-sm"
                    />
                  ) : (
                    <span className="flex items-center gap-1.5 min-w-0">
                      <button
                        onClick={() => startRename(layer)}
                        className={`text-sm font-medium truncate text-left hover:underline ${layer.visible ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}
                        title="Click to rename"
                      >
                        {layer.name}
                      </button>
                      {!layer.owned && (
                        <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded px-1.5 py-0.5 shrink-0">
                          Shared
                        </span>
                      )}
                    </span>
                  )}
                  <span className="text-xs text-neutral-400">
                    {layer.locations.length} location{layer.locations.length === 1 ? '' : 's'}
                  </span>
                </div>

                <button
                  onClick={() => handleShare(layer)}
                  className="p-1.5 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-white shrink-0"
                  aria-label={`Share ${layer.name}`}
                  title="Copy share link"
                >
                  {copiedId === layer.id ? <CheckIcon className="w-4 h-4 text-green-600" /> : <ShareIcon className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(`Delete layer "${layer.name}"? This can't be undone.`)) onDeleteLayer(layer.id)
                  }}
                  className="p-1.5 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 shrink-0"
                  aria-label={`Delete ${layer.name}`}
                  title="Delete layer"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
