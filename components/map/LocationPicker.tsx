'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { KOSOVO_CENTER } from '@/lib/constants'

const pickerIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 32px;
    height: 32px;
    background: #1D9E75;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid white;
    box-shadow: 0 2px 12px rgba(0,0,0,0.4);
  "></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
})

interface LocationPickerInnerProps {
  onLocationSelect: (lat: number, lng: number) => void
  position: [number, number] | null
}

function LocationPickerInner({ onLocationSelect, position }: LocationPickerInnerProps) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })

  return position ? <Marker position={position} icon={pickerIcon} /> : null
}

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void
  initialPosition?: [number, number] | null
  height?: string
}

export default function LocationPicker({ onLocationSelect, initialPosition, height = '350px' }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(initialPosition || null)

  function handleSelect(lat: number, lng: number) {
    setPosition([lat, lng])
    onLocationSelect(lat, lng)
  }

  return (
    <div style={{ height, borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
      <MapContainer
        center={KOSOVO_CENTER}
        zoom={10}
        style={{ height: '100%', width: '100%', cursor: 'crosshair' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationPickerInner onLocationSelect={handleSelect} position={position} />
      </MapContainer>
    </div>
  )
}
