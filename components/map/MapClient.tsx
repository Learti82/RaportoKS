'use client'

import dynamic from 'next/dynamic'
import type { Report } from '@/lib/types'

const ReportMap = dynamic(() => import('./ReportMap'), { ssr: false })
const LocationPicker = dynamic(() => import('./LocationPicker'), { ssr: false })

interface MapClientProps {
  reports: Report[]
  height?: string
  center?: [number, number]
  zoom?: number
  interactive?: boolean
}

export function MapClient(props: MapClientProps) {
  return <ReportMap {...props} />
}

interface LocationPickerClientProps {
  onLocationSelect: (lat: number, lng: number) => void
  initialPosition?: [number, number] | null
  height?: string
}

export function LocationPickerClient(props: LocationPickerClientProps) {
  return <LocationPicker {...props} />
}
