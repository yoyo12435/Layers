import { useEffect, useRef } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import type { LatLngExpression, LatLngTuple } from 'leaflet'
import type { Location } from '../types'
import { categoryIcon, pendingPinIcon } from '../lib/mapIcons'

export interface FlatLocation {
  location: Location
  layerId: string
}

interface MapViewProps {
  locations: FlatLocation[]
  placing: boolean
  pendingPoint: LatLngTuple | null
  onMapClick: (lat: number, lng: number) => void
  onMarkerClick: (item: FlatLocation) => void
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

export function MapView({ locations, placing, pendingPoint, onMapClick, onMarkerClick }: MapViewProps) {
  return (
    <div className={`absolute inset-0 ${placing ? 'cursor-crosshair' : ''}`}>
      <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} scrollWheelZoom className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler active={placing} onClick={onMapClick} />
        <FitToLocations locations={locations} />
        {locations.map(({ location, layerId }) => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
            icon={categoryIcon(location.category)}
            eventHandlers={{ click: () => onMarkerClick({ location, layerId }) }}
          />
        ))}
        {pendingPoint && <Marker position={pendingPoint} icon={pendingPinIcon()} />}
      </MapContainer>
    </div>
  )
}
