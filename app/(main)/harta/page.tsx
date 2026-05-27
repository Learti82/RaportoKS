import { createClient } from '@/lib/supabase/server'
import { MapClient } from '@/components/map/MapClient'
import { CATEGORIES } from '@/lib/constants'
import type { Report } from '@/lib/types'

async function getAllReports(): Promise<Report[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false })
    return data || []
  } catch {
    return []
  }
}

export default async function HartaPage() {
  const reports = await getAllReports()

  return (
    <div className="relative h-[calc(100vh-4rem)]">
      <MapClient reports={reports} height="100%" />

      {/* Legend overlay */}
      <div className="absolute top-4 left-4 z-10 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 max-w-xs">
        <h2 className="font-bold text-sm mb-3 text-gray-900 dark:text-white">
          Harta e Raporteve — {reports.length} raporte
        </h2>
        <div className="space-y-1.5">
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-300">
                {cat.emoji} {cat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
