import { useEffect, useRef } from 'react'
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { LatLngBounds, LatLngExpression, LatLngTuple } from 'leaflet'
import type { Location } from '../types'
import { categoryIcon, currentLocationIcon, pendingPinIcon } from '../lib/mapIcons'
import type { GeoPosition } from '../lib/geolocation'

export interface FlatLocation {
  location: Location
  layerId: string
}

interface FlyToRequest {
  lat: number
  lng: number
  zoom?: number
  token: number
}

interface MapViewProps {
  locations: FlatLocation[]
  editMode: boolean
  pendingPoint: LatLngTuple | null
  currentLocation: GeoPosition | null
  flyTo: FlyToRequest | null
  onMapClick: (lat: number, lng: number) => void
  onMarkerClick: (item: FlatLocation) => void
  onBoundsChange?: (bounds: LatLngBounds) => void
}

const DEFAULT_CENTER: LatLngExpression = [40.7128, -74.006]
const DEFAULT_ZOOM = 12

function ClickHandler({ active, onClick }: { active: boolean; onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (active) onClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function FitToLocations({ locations }: { locations: FlatLocation[] }) {
  const map = useMap()
  const didInitialFit = useRef(false)

  useEffect(() => {
    if (didInitialFit.current || locations.length === 0) return
    didInitialFit.current = true
    const points: LatLngTuple[] = locations.map((l) => [l.location.lat, l.location.lng])
    if (points.length === 1) {
      map.setView(points[0], 14)
    } else {
      map.fitBounds(points, { padding: [56, 56], maxZoom: 15 })
    }
  }, [locations, map])

  return null
}

function FlyToController({ flyTo }: { flyTo: FlyToRequest | null }) {
  const map = useMap()
  const lastToken = useRef<number | null>(null)

  useEffect(() => {
    if (!flyTo || flyTo.token === lastToken.current) return
    lastToken.current = flyTo.token
    map.flyTo([flyTo.lat, flyTo.lng], flyTo.zoom ?? Math.max(map.getZoom(), 15))
  }, [flyTo, map])

  return null
}

function BoundsReporter({ onBoundsChange }: { onBoundsChange?: (bounds: LatLngBounds) => void }) {
  const map = useMapEvents({
    moveend() {
      onBoundsChange?.(map.getBounds())
    },
  })

  useEffect(() => {
    onBoundsChange?.(map.getBounds())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

export function MapView({ locations, editMode, pendingPoint, currentLocation, flyTo, onMapClick, onMarkerClick, onBoundsChange }: MapViewProps) {
  return (
    <div className={`absolute inset-0 ${editMode ? 'cursor-crosshair' : ''}`}>
      <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} scrollWheelZoom zoomControl={false} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler active={editMode} onClick={onMapClick} />
        <FitToLocations locations={locations} />
        <FlyToController flyTo={flyTo} />
        <BoundsReporter onBoundsChange={onBoundsChange} />
        {locations.map(({ location, layerId }) => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
            icon={categoryIcon(location.category)}
            eventHandlers={{
              click: (e) => {
                L.DomEvent.stopPropagation(e)
                onMarkerClick({ location, layerId })
              },
            }}
          />
        ))}
        {pendingPoint && <Marker position={pendingPoint} icon={pendingPinIcon()} />}
        {currentLocation && (
          <>
            <Circle
              center={[currentLocation.lat, currentLocation.lng]}
              radius={currentLocation.accuracy}
              pathOptions={{ color: '#4285f4', fillColor: '#4285f4', fillOpacity: 0.12, weight: 1 }}
            />
            <Marker position={[currentLocation.lat, currentLocation.lng]} icon={currentLocationIcon()} />
          </>
        )}
      </MapContainer>
    </div>
  )
}
