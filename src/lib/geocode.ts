export interface GeocodeResult {
  displayName: string
  shortName: string
  lat: number
  lng: number
}

export async function searchPlaces(query: string, signal?: AbortSignal, countryCode?: string | null): Promise<GeocodeResult[]> {
  let url = `https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(query)}`
  if (countryCode) url += `&countrycodes=${encodeURIComponent(countryCode.toLowerCase())}`
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error('Search failed')
  const data: Array<{ display_name: string; lat: string; lon: string }> = await res.json()
  return data.map((d) => ({
    displayName: d.display_name,
    shortName: d.display_name.split(',')[0],
    lat: parseFloat(d.lat),
    lng: parseFloat(d.lon),
  }))
}
