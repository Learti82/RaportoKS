'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import Link from 'next/link'
import { Report } from '@/lib/types'
import { CATEGORIES, KOSOVO_CENTER, KOSOVO_DEFAULT_ZOOM } from '@/lib/constants'
import { StatusBadge } from '@/components/reports/StatusBadge'
import { CategoryBadge } from '@/components/reports/CategoryBadge'
import { Heart } from 'lucide-react'

function createMarkerIcon(color: string, emoji: string) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 32px;
      height: 32px;
      background: ${color};
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span style="transform: rotate(45deg); font-size: 13px; display: block; text-align: center; line-height: 28px;">${emoji}</span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  })
}

interface ReportMapProps {
  reports: Report[]
  height?: string
  center?: [number, number]
  zoom?: number
  interactive?: boolean
}

export default function ReportMap({
  reports,
  height = '100%',
  center = KOSOVO_CENTER,
  zoom = KOSOVO_DEFAULT_ZOOM,
  interactive = true,
}: ReportMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: '100%' }}
      zoomControl={interactive}
      dragging={interactive}
      touchZoom={interactive}
      doubleClickZoom={interactive}
      scrollWheelZoom={interactive}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {reports.map((report) => {
        const cat = CATEGORIES[report.category]
        if (!cat) return null
        return (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={createMarkerIcon(cat.color, cat.emoji)}
          >
            <Popup>
              <div className="min-w-[200px]">
                <p className="font-semibold text-sm mb-2 pr-4">{report.title}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  <CategoryBadge category={report.category} size="sm" />
                  <StatusBadge status={report.status} size="sm" />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{report.municipality}</span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" /> {report.upvotes}
                  </span>
                </div>
                <Link
                  href={`/raport/${report.id}`}
                  className="block text-center text-xs bg-[#1D9E75] text-white px-3 py-1.5 rounded-md hover:bg-[#17836B] transition-colors"
                >
                  Shiko Detajet →
                </Link>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
