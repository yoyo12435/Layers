import type { Category } from '../types'

export interface OsmPlace {
  id: string
  name: string
  category: Category
  lat: number
  lng: number
}

interface OverpassBounds {
  south: number
  west: number
  north: number
  east: number
}

interface OverpassElement {
  type: string
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

export async function fetchNearbyPlaces(bounds: OverpassBounds, signal?: AbortSignal): Promise<OsmPlace[]> {
  const bbox = `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`
  const query = `[out:json][timeout:15];(node["amenity"="restaurant"](${bbox});way["amenity"="restaurant"](${bbox}););out center 60;`

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    signal,
  })
  if (!res.ok) throw new Error('Overpass request failed')
  const data: { elements: OverpassElement[] } = await res.json()

  const places: OsmPlace[] = []
  for (const el of data.elements) {
    const lat = el.lat ?? el.center?.lat
    const lng = el.lon ?? el.center?.lon
    if (lat == null || lng == null) continue
    const tags = el.tags ?? {}
    const category: Category = 'restaurant'
    places.push({
      id: `osm-${el.type}-${el.id}`,
      name: tags.name || 'Restaurant',
      category,
      lat,
      lng,
    })
  }
  return places
}
