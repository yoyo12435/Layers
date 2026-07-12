import { useCallback, useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { collection, doc, deleteDoc, onSnapshot, orderBy, query, setDoc, updateDoc, type CollectionReference } from 'firebase/firestore'
import type { Layer, Location } from '../types'
import { db } from './firebase'
import { clearShareParamFromUrl, readSharedLayerFromUrl } from './share'

export function useCloudLayers(uid: string | null) {
  const [layers, setLayers] = useState<Layer[]>([])
  const [importedLayerName, setImportedLayerName] = useState<string | null>(null)

  const layersRef: CollectionReference | null = uid && db ? collection(db, 'users', uid, 'layers') : null

  useEffect(() => {
    if (!layersRef) {
      setLayers([])
      return
    }
    return onSnapshot(query(layersRef, orderBy('createdAt', 'asc')), (snap) => {
      setLayers(snap.docs.map((d) => d.data() as Layer))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid])

  useEffect(() => {
    if (!layersRef) return
    const shared = readSharedLayerFromUrl()
    if (!shared) return
    clearShareParamFromUrl()
    // Always import as a brand-new doc, even if you're opening your own
    // share link — reusing the original layer's id would overwrite (and
    // flip the ownership of) the layer you already own.
    const importedId = uuid()
    setDoc(doc(layersRef, importedId), {
      ...shared,
      id: importedId,
      visible: true,
      owned: false,
      createdAt: Date.now(),
    }).then(() => setImportedLayerName(shared.name))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid])

  const createLayer = useCallback(
    (name: string) => {
      const id = uuid()
      if (layersRef) {
        setDoc(doc(layersRef, id), {
          id,
          name,
          locations: [],
          visible: true,
          owned: true,
          createdAt: Date.now(),
        })
      }
      return id
    },
    [layersRef],
  )

  const deleteLayer = useCallback(
    (layerId: string) => {
      if (layersRef) deleteDoc(doc(layersRef, layerId))
    },
    [layersRef],
  )

  const renameLayer = useCallback(
    (layerId: string, name: string) => {
      if (layersRef) updateDoc(doc(layersRef, layerId), { name })
    },
    [layersRef],
  )

  const toggleLayerVisibility = useCallback(
    (layerId: string) => {
      const layer = layers.find((l) => l.id === layerId)
      if (layersRef && layer) updateDoc(doc(layersRef, layerId), { visible: !layer.visible })
    },
    [layersRef, layers],
  )

  const addLocation = useCallback(
    (layerId: string, location: Omit<Location, 'id'>) => {
      const layer = layers.find((l) => l.id === layerId)
      if (!layersRef || !layer) return
      const newLocation: Location = { ...location, id: uuid() }
      updateDoc(doc(layersRef, layerId), { locations: [...layer.locations, newLocation] })
    },
    [layersRef, layers],
  )

  const updateLocation = useCallback(
    (layerId: string, locationId: string, updates: Partial<Omit<Location, 'id'>>) => {
      const layer = layers.find((l) => l.id === layerId)
      if (!layersRef || !layer) return
      const newLocations = layer.locations.map((loc) => (loc.id === locationId ? { ...loc, ...updates } : loc))
      updateDoc(doc(layersRef, layerId), { locations: newLocations })
    },
    [layersRef, layers],
  )

  const deleteLocation = useCallback(
    (layerId: string, locationId: string) => {
      const layer = layers.find((l) => l.id === layerId)
      if (!layersRef || !layer) return
      updateDoc(doc(layersRef, layerId), { locations: layer.locations.filter((loc) => loc.id !== locationId) })
    },
    [layersRef, layers],
  )

  // Adds/updates/removes a single location (matched by id) across whichever
  // owned layers it should belong to, so the same pin can live in several
  // layers at once and stay in sync when edited.
  const setLocationLayers = useCallback(
    (locationId: string, fields: Omit<Location, 'id'>, layerIds: string[]) => {
      if (!layersRef) return
      for (const layer of layers) {
        if (!layer.owned) continue
        const hasEntry = layer.locations.some((loc) => loc.id === locationId)
        const wantEntry = layerIds.includes(layer.id)
        if (wantEntry) {
          const newLocations = hasEntry
            ? layer.locations.map((loc) => (loc.id === locationId ? { ...loc, ...fields } : loc))
            : [...layer.locations, { id: locationId, ...fields }]
          updateDoc(doc(layersRef, layer.id), { locations: newLocations })
        } else if (hasEntry) {
          updateDoc(doc(layersRef, layer.id), { locations: layer.locations.filter((loc) => loc.id !== locationId) })
        }
      }
    },
    [layersRef, layers],
  )

  const deleteLocationEverywhere = useCallback(
    (locationId: string) => {
      if (!layersRef) return
      for (const layer of layers) {
        if (!layer.locations.some((loc) => loc.id === locationId)) continue
        updateDoc(doc(layersRef, layer.id), { locations: layer.locations.filter((loc) => loc.id !== locationId) })
      }
    },
    [layersRef, layers],
  )

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
    setLocationLayers,
    deleteLocationEverywhere,
  }
}
