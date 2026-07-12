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

const AMENITIES = ['restaurant', 'cafe', 'fast_food', 'bar', 'pub', 'nightclub']

const AMENITY_CATEGORY: Record<string, Category> = {
  restaurant: 'restaurant',
  cafe: 'restaurant',
  fast_food: 'restaurant',
  bar: 'entertainment',
  pub: 'entertainment',
  nightclub: 'entertainment',
}

const AMENITY_LABEL: Record<string, string> = {
  restaurant: 'Restaurant',
  cafe: 'Cafe',
  fast_food: 'Fast food',
  bar: 'Bar',
  pub: 'Pub',
  nightclub: 'Nightclub',
}

export async function fetchNearbyPlaces(bounds: OverpassBounds, signal?: AbortSignal): Promise<OsmPlace[]> {
  const bbox = `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`
  const clauses = AMENITIES.map((a) => `node["amenity"="${a}"](${bbox});way["amenity"="${a}"](${bbox});`).join('')
  const query = `[out:json][timeout:15];(${clauses});out center 90;`

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
    const amenity = tags.amenity ?? 'restaurant'
    const category: Category = AMENITY_CATEGORY[amenity] ?? 'other'
    places.push({
      id: `osm-${el.type}-${el.id}`,
      name: tags.name || AMENITY_LABEL[amenity] || 'Place',
      category,
      lat,
      lng,
    })
  }
  return places
}
