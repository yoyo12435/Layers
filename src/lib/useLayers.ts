import { useCallback, useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'
import type { Layer, Location } from '../types'
import { loadLayers, saveLayers } from './storage'
import { clearShareParamFromUrl, readSharedLayerFromUrl } from './share'

export function useLayers() {
  const [layers, setLayers] = useState<Layer[]>(() => loadLayers())
  const [importedLayerName, setImportedLayerName] = useState<string | null>(null)

  useEffect(() => {
    saveLayers(layers)
  }, [layers])

  // Import a layer from a share link on first load.
  useEffect(() => {
    const shared = readSharedLayerFromUrl()
    if (!shared) return
    clearShareParamFromUrl()
    setLayers((prev) => {
      if (prev.some((l) => l.id === shared.id)) return prev
      setImportedLayerName(shared.name)
      return [...prev, { ...shared, visible: true }]
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const createLayer = useCallback((name: string) => {
    const layer: Layer = { id: uuid(), name, locations: [], visible: true }
    setLayers((prev) => [...prev, layer])
    return layer.id
  }, [])

  const deleteLayer = useCallback((layerId: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== layerId))
  }, [])

  const renameLayer = useCallback((layerId: string, name: string) => {
    setLayers((prev) => prev.map((l) => (l.id === layerId ? { ...l, name } : l)))
  }, [])

  const toggleLayerVisibility = useCallback((layerId: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l)),
    )
  }, [])

  const addLocation = useCallback(
    (layerId: string, location: Omit<Location, 'id'>) => {
      const newLocation: Location = { ...location, id: uuid() }
      setLayers((prev) =>
        prev.map((l) =>
          l.id === layerId ? { ...l, locations: [...l.locations, newLocation] } : l,
        ),
      )
    },
    [],
  )

  const updateLocation = useCallback(
    (layerId: string, locationId: string, updates: Partial<Omit<Location, 'id'>>) => {
      setLayers((prev) =>
        prev.map((l) =>
          l.id !== layerId
            ? l
            : {
                ...l,
                locations: l.locations.map((loc) =>
                  loc.id === locationId ? { ...loc, ...updates } : loc,
                ),
              },
        ),
      )
    },
    [],
  )

  const deleteLocation = useCallback((layerId: string, locationId: string) => {
    setLayers((prev) =>
      prev.map((l) =>
        l.id !== layerId
          ? l
          : { ...l, locations: l.locations.filter((loc) => loc.id !== locationId) },
      ),
    )
  }, [])

  return {
    layers,
    importedLayerName,
    clearImportedLayerName: () => setImportedLayerName(null),
    createLayer,
    deleteLayer,
    renameLayer,
    toggleLayerVisibility,
    addLocation,
    updateLocation,
    deleteLocation,
  }
}
