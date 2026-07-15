import { Fragment, useRef, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import type { Layer } from '../types'
import {
  ArchiveIcon,
  CheckIcon,
  DuplicateIcon,
  EyeIcon,
  EyeOffIcon,
  MoreIcon,
  PencilIcon,
  PinIcon,
  PlusIcon,
  RefreshIcon,
  ShareIcon,
  SortIcon,
  TrashIcon,
  XIcon,
} from './icons'
import { sortLayers, type SortMode } from '../lib/sortLayers'

const SORT_LABELS: Record<SortMode, string> = {
  alpha: 'A–Z',
  'recent-changed': 'Recently changed',
  'recent-added': 'Recently added',
}

interface LayersPanelProps {
  layers: Layer[]
  onClose: () => void
  onToggleVisibility: (layerId: string) => void
  onTogglePinned: (layerId: string) => void
  onToggleArchived: (layerId: string) => void
  onDeleteLayer: (layerId: string) => void
  onRenameLayer: (layerId: string, name: string) => void
  onCreateLayer: (name: string) => string
  onDuplicateLayer: (sourceLayerId: string, targetLayerId: string) => void
  onShareLayer: (layerId: string) => Promise<string>
  onRefreshLayer: (layerId: string) => Promise<boolean>
  pinnedLayer: Layer
  onTogglePinnedVisible: () => void
  pinnedLoading: boolean
  pinnedTooZoomedOut: boolean
}

export function LayersPanel({
  layers,
  onClose,
  onToggleVisibility,
  onTogglePinned,
  onToggleArchived,
  onDeleteLayer,
  onRenameLayer,
  onCreateLayer,
  onDuplicateLayer,
  onShareLayer,
  onRefreshLayer,
  pinnedLayer,
  onTogglePinnedVisible,
  pinnedLoading,
  pinnedTooZoomedOut,
}: LayersPanelProps) {
  const [openMenu, setOpenMenu] = useState<{ layerId: string; top?: number; bottom?: number; right: number } | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [sharingId, setSharingId] = useState<string | null>(null)
  const [refreshingId, setRefreshingId] = useState<string | null>(null)
  const [refreshedId, setRefreshedId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [creatingLayer, setCreatingLayer] = useState(false)
  const [newLayerName, setNewLayerName] = useState('')
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)
  const [duplicatedInto, setDuplicatedInto] = useState<Record<string, string>>({})
  const [allHidden, setAllHidden] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [sortMode, setSortMode] = useState<SortMode>('alpha')
  const [sortMenuOpen, setSortMenuOpen] = useState(false)
  const hiddenSnapshotRef = useRef<Record<string, boolean> | null>(null)

  const visibleList = layers.filter((l) => (showArchived ? l.archived : !l.archived))
  const sortedLayers = sortLayers(visibleList, sortMode)
  const ownedTargets = layers.filter((l) => l.owned && !l.archived)

  const handleToggleAllVisibility = () => {
    if (!allHidden) {
      const snapshot: Record<string, boolean> = { [pinnedLayer.id]: pinnedLayer.visible }
      if (pinnedLayer.visible) onTogglePinnedVisible()
      for (const layer of layers) {
        if (layer.archived) continue
        snapshot[layer.id] = layer.visible
        if (layer.visible) onToggleVisibility(layer.id)
      }
      hiddenSnapshotRef.current = snapshot
      setAllHidden(true)
    } else {
      const snapshot = hiddenSnapshotRef.current
      if (snapshot) {
        if (snapshot[pinnedLayer.id] && !pinnedLayer.visible) onTogglePinnedVisible()
        for (const layer of layers) {
          if (layer.archived) continue
          if (snapshot[layer.id] && !layer.visible) onToggleVisibility(layer.id)
        }
      }
      hiddenSnapshotRef.current = null
      setAllHidden(false)
    }
  }

  const submitCreateLayer = () => {
    const trimmed = newLayerName.trim()
    if (trimmed) onCreateLayer(trimmed)
    setNewLayerName('')
    setCreatingLayer(false)
  }

  const handleShare = async (layer: Layer) => {
    setSharingId(layer.id)
    try {
      const url = await onShareLayer(layer.id)
      try {
        await navigator.clipboard.writeText(url)
      } catch {
        window.prompt('Copy this share link:', url)
      }
      setCopiedId(layer.id)
      setTimeout(() => {
        setCopiedId((id) => (id === layer.id ? null : id))
        setOpenMenu((m) => (m?.layerId === layer.id ? null : m))
      }, 1200)
    } catch {
      window.alert("Couldn't create a share link. Please try again.")
      setOpenMenu(null)
    } finally {
      setSharingId(null)
    }
  }

  const handleRefresh = async (layer: Layer) => {
    if (!layer.sourceShareId) {
      window.alert("This layer can't be refreshed — it wasn't imported from a share link.")
      setOpenMenu(null)
      return
    }
    setRefreshingId(layer.id)
    try {
      const ok = await onRefreshLayer(layer.id)
      if (ok) {
        setRefreshedId(layer.id)
        setTimeout(() => {
          setRefreshedId((id) => (id === layer.id ? null : id))
          setOpenMenu((m) => (m?.layerId === layer.id ? null : m))
        }, 1200)
      } else {
        window.alert("Couldn't refresh this layer. The original share link may no longer exist.")
        setOpenMenu(null)
      }
    } finally {
      setRefreshingId(null)
    }
  }

  const toggleRowMenu = (layer: Layer, e: MouseEvent<HTMLButtonElement>) => {
    if (openMenu?.layerId === layer.id) {
      setOpenMenu(null)
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const estimatedMenuHeight = 320
    const spaceBelow = window.innerHeight - rect.bottom
    const openUpward = spaceBelow < estimatedMenuHeight && rect.top > spaceBelow
    setOpenMenu({
      layerId: layer.id,
      right: window.innerWidth - rect.right,
      ...(openUpward ? { bottom: window.innerHeight - rect.top + 6 } : { top: rect.bottom + 6 }),
    })
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
      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col layers-panel-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">{showArchived ? 'Archived Layers' : 'Your Layers'}</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleAllVisibility}
              className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500"
              aria-label={allHidden ? 'Show all layers' : 'Hide all layers'}
              title={allHidden ? 'Show all layers' : 'Hide all layers'}
            >
              {allHidden ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setSortMenuOpen((v) => !v)}
                className={`p-1.5 rounded-full transition-colors ${sortMenuOpen ? 'bg-neutral-100 text-neutral-800' : 'hover:bg-neutral-100 text-neutral-500'}`}
                aria-label="Sort layers"
                title={`Sort: ${SORT_LABELS[sortMode]}`}
              >
                <SortIcon className="w-5 h-5" />
              </button>
              {sortMenuOpen && (
                <>
                  <div className="fixed inset-0 z-[900]" onClick={() => setSortMenuOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-48 bg-white shadow-xl border border-neutral-200 rounded-xl overflow-hidden z-[901]">
                    {(Object.keys(SORT_LABELS) as SortMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => {
                          setSortMode(mode)
                          setSortMenuOpen(false)
                        }}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm text-left hover:bg-neutral-50"
                      >
                        <span className={sortMode === mode ? 'font-semibold text-neutral-900' : 'text-neutral-600'}>
                          {SORT_LABELS[mode]}
                        </span>
                        {sortMode === mode && <CheckIcon className="w-4 h-4 text-neutral-900" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => {
                setShowArchived(false)
                setCreatingLayer(true)
              }}
              className="p-1.5 rounded-full border border-neutral-300 hover:bg-neutral-100 text-neutral-600"
              aria-label="Create a new layer"
              title="New layer"
            >
              <PlusIcon className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowArchived((v) => !v)}
              className={`p-1.5 rounded-full transition-colors ${showArchived ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-500'}`}
              aria-label={showArchived ? 'Back to your layers' : 'Show archived layers'}
              title={showArchived ? 'Back to your layers' : 'Show archived layers'}
            >
              <ArchiveIcon className="w-5 h-5" />
            </button>

            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500" aria-label="Close">
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {creatingLayer && (
          <div className="px-5 py-3 border-b border-neutral-200">
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
                className="flex-1 min-w-0 border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-800"
              />
              <button onClick={submitCreateLayer} className="bg-neutral-900 text-white text-sm font-medium rounded-lg px-3 py-2 shrink-0">
                Create
              </button>
              <button onClick={() => setCreatingLayer(false)} className="p-2 rounded-lg text-neutral-400 shrink-0">
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto" onScroll={() => setOpenMenu(null)}>
          <ul className="divide-y divide-neutral-100">
            {!showArchived && (
              <li className="px-5 py-3 flex items-center gap-3 bg-neutral-50">
                <button
                  onClick={onTogglePinnedVisible}
                  className={`p-1.5 rounded-full shrink-0 transition-colors ${pinnedLayer.visible ? 'text-neutral-700 hover:bg-neutral-100' : 'text-neutral-300 hover:bg-neutral-100'}`}
                  aria-label={pinnedLayer.visible ? `Hide ${pinnedLayer.name}` : `Show ${pinnedLayer.name}`}
                  title={pinnedLayer.visible ? 'Visible — tap to hide' : 'Hidden — tap to show'}
                >
                  {pinnedLayer.visible ? <EyeIcon className="w-5 h-5" /> : <EyeOffIcon className="w-5 h-5" />}
                </button>

                <div className="flex-1 min-w-0">
                  <span className="flex items-center gap-1.5 min-w-0">
                    <PinIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className={`text-sm font-medium truncate ${pinnedLayer.visible ? 'text-neutral-900' : 'text-neutral-400'}`}>
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
            )}

            {sortedLayers.length === 0 && (
              <p className="px-5 py-8 text-center text-neutral-400 text-sm">
                {showArchived ? 'No archived layers.' : 'No layers yet. Create one to get started, or open a share link.'}
              </p>
            )}

            {sortedLayers.map((layer) => (
              <Fragment key={layer.id}>
                <li className="px-5 py-3 flex items-center gap-3">
                  {!layer.archived && (
                    <button
                      onClick={() => onToggleVisibility(layer.id)}
                      className={`p-1.5 rounded-full shrink-0 transition-colors ${layer.visible ? 'text-neutral-700 hover:bg-neutral-100' : 'text-neutral-300 hover:bg-neutral-100'}`}
                      aria-label={layer.visible ? `Hide ${layer.name}` : `Show ${layer.name}`}
                      title={layer.visible ? 'Visible — click to hide' : 'Hidden — click to show'}
                    >
                      {layer.visible ? <EyeIcon className="w-5 h-5" /> : <EyeOffIcon className="w-5 h-5" />}
                    </button>
                  )}

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
                        className="w-full border border-neutral-300 rounded px-2 py-1 text-sm"
                      />
                    ) : (
                      <span className="flex items-center gap-1.5 min-w-0">
                        {layer.pinned && <PinIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                        <span className={`text-sm font-medium truncate ${layer.visible ? 'text-neutral-900' : 'text-neutral-400'}`}>
                          {layer.name}
                        </span>
                        {!layer.owned && (
                          <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-400 bg-neutral-100 rounded px-1.5 py-0.5 shrink-0">
                            Shared
                          </span>
                        )}
                      </span>
                    )}
                    <span className="text-xs text-neutral-400">
                      {layer.locations.length} location{layer.locations.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="relative shrink-0">
                    <button
                      onClick={(e) => toggleRowMenu(layer, e)}
                      className={`p-1.5 rounded-full transition-colors ${openMenu?.layerId === layer.id ? 'bg-neutral-100 text-neutral-800' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800'}`}
                      aria-label={`More options for ${layer.name}`}
                      title="More options"
                    >
                      <MoreIcon className="w-5 h-5" />
                    </button>

                    {openMenu?.layerId === layer.id &&
                      createPortal(
                        <>
                          <div className="fixed inset-0 z-[900]" onClick={() => setOpenMenu(null)} />
                          <div
                            className="fixed w-44 bg-white shadow-xl border border-neutral-200 rounded-xl overflow-hidden z-[901]"
                            style={{ right: openMenu.right, top: openMenu.top, bottom: openMenu.bottom }}
                          >
                            <button
                              onClick={() => handleShare(layer)}
                              disabled={sharingId === layer.id}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                            >
                              {copiedId === layer.id ? (
                                <CheckIcon className="w-4 h-4 text-green-600" />
                              ) : (
                                <ShareIcon className={`w-4 h-4 ${sharingId === layer.id ? 'animate-pulse' : ''}`} />
                              )}
                              {copiedId === layer.id ? 'Copied!' : 'Share'}
                            </button>

                            <button
                              onClick={() => {
                                setOpenMenu(null)
                                onTogglePinned(layer.id)
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-neutral-700 hover:bg-neutral-50"
                            >
                              <PinIcon className={`w-4 h-4 ${layer.pinned ? 'text-amber-500' : ''}`} />
                              {layer.pinned ? 'Unpin' : 'Pin'}
                            </button>

                            {!layer.owned && (
                              <button
                                onClick={() => handleRefresh(layer)}
                                disabled={refreshingId === layer.id}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                              >
                                {refreshedId === layer.id ? (
                                  <CheckIcon className="w-4 h-4 text-green-600" />
                                ) : (
                                  <RefreshIcon className={`w-4 h-4 ${refreshingId === layer.id ? 'animate-spin' : ''}`} />
                                )}
                                {refreshedId === layer.id ? 'Refreshed!' : 'Refresh'}
                              </button>
                            )}

                            {layer.owned && (
                              <button
                                onClick={() => {
                                  setOpenMenu(null)
                                  startRename(layer)
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-neutral-700 hover:bg-neutral-50"
                              >
                                <PencilIcon className="w-4 h-4" />
                                Rename
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setOpenMenu(null)
                                setDuplicatingId((id) => (id === layer.id ? null : layer.id))
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-neutral-700 hover:bg-neutral-50"
                            >
                              <DuplicateIcon className="w-4 h-4" />
                              Copy
                            </button>

                            <button
                              onClick={() => {
                                setOpenMenu(null)
                                onToggleArchived(layer.id)
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-neutral-700 hover:bg-neutral-50"
                            >
                              <ArchiveIcon className="w-4 h-4" />
                              {layer.archived ? 'Unarchive' : 'Archive'}
                            </button>

                            <button
                              onClick={() => {
                                setOpenMenu(null)
                                if (window.confirm(`Delete layer "${layer.name}"? This can't be undone.`)) onDeleteLayer(layer.id)
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-red-600 hover:bg-red-50"
                            >
                              <TrashIcon className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </>,
                        document.body,
                      )}
                  </div>
                </li>

                {duplicatingId === layer.id && (
                  <li className="px-5 py-3 bg-neutral-50">
                    <p className="text-xs font-medium text-neutral-500 mb-1.5">Insert all locations into…</p>
                    {ownedTargets.filter((t) => t.id !== layer.id).length === 0 ? (
                      <p className="text-xs text-neutral-400">You don't have any other layers yet. Create one first.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {ownedTargets
                          .filter((t) => t.id !== layer.id)
                          .map((target) => {
                            const done = duplicatedInto[layer.id] === target.id
                            return (
                              <button
                                key={target.id}
                                type="button"
                                onClick={() => {
                                  if (done) return
                                  onDuplicateLayer(layer.id, target.id)
                                  setDuplicatedInto((prev) => ({ ...prev, [layer.id]: target.id }))
                                }}
                                disabled={done}
                                className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-full border transition-colors ${
                                  done ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-neutral-300 text-neutral-600'
                                }`}
                              >
                                {done ? <CheckIcon className="w-3 h-3" /> : <PlusIcon className="w-3 h-3" />}
                                {target.name}
                              </button>
                            )
                          })}
                      </div>
                    )}
                  </li>
                )}
              </Fragment>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
