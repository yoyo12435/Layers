import { useEffect, useRef, useState } from 'react'
import type { LatLngBounds } from 'leaflet'
import type { Layer, Location } from '../types'
import { fetchNearbyPlaces } from './overpass'

const NEARBY_LAYER_ID = 'nearby-osm'
const MAX_SPAN_DEGREES = 0.06

function toLocations(places: Awaited<ReturnType<typeof fetchNearbyPlaces>>): Location[] {
  return places.map((p) => ({
    id: p.id,
    name: p.name,
    description: '',
    rating: 0,
    category: p.category,
    lat: p.lat,
    lng: p.lng,
  }))
}

export function useNearbyLayer(bounds: LatLngBounds | null) {
  const [locations, setLocations] = useState<Location[]>([])
  const [visible, setVisible] = useState(true)
  const [loading, setLoading] = useState(false)
  const [tooZoomedOut, setTooZoomedOut] = useState(false)
  const lastKeyRef = useRef<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!bounds || !visible) return

    const span = Math.max(bounds.getNorth() - bounds.getSouth(), bounds.getEast() - bounds.getWest())
    if (span > MAX_SPAN_DEGREES) {
      setTooZoomedOut(true)
      return
    }
    setTooZoomedOut(false)

    const key = [bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast()].map((n) => n.toFixed(3)).join(',')
    if (key === lastKeyRef.current) return

    const timer = setTimeout(() => {
      lastKeyRef.current = key
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setLoading(true)
      fetchNearbyPlaces(
        { south: bounds.getSouth(), west: bounds.getWest(), north: bounds.getNorth(), east: bounds.getEast() },
        controller.signal,
      )
        .then((places) => setLocations(toLocations(places)))
        .catch((err) => {
          if (err.name !== 'AbortError') setLocations([])
        })
        .finally(() => setLoading(false))
    }, 700)

    return () => clearTimeout(timer)
  }, [bounds, visible])

  const nearbyLayer: Layer = {
    id: NEARBY_LAYER_ID,
    name: 'Nearby restaurants & parks',
    locations,
    visible,
    owned: false,
  }

  return {
    nearbyLayer,
    toggleNearbyVisible: () => setVisible((v) => !v),
    loading,
    tooZoomedOut,
  }
}

export { NEARBY_LAYER_ID }
