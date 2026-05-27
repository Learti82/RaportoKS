import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ReportCard } from '@/components/reports/ReportCard'
import { Skeleton } from '@/components/ui/skeleton'
import { CATEGORIES } from '@/lib/constants'
import type { Report } from '@/lib/types'

const ReportMap = dynamic(() => import('@/components/map/ReportMap'), { ssr: false })

async function getReports(): Promise<Report[]> {
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    return data || []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const reports = await getReports()
  const latestReports = reports.slice(0, 10)

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)]">
      {/* Map on top for mobile */}
      <div className="md:hidden h-[300px] relative">
        <ReportMap reports={reports} height="300px" />
      </div>

      {/* Left panel: report list */}
      <div className="md:w-[40%] flex flex-col overflow-hidden border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-900">
          <div>
            <h1 className="font-bold text-lg text-gray-900 dark:text-white">Raportet e fundit</h1>
            <p className="text-xs text-gray-500">{reports.length} raporte aktive</p>
          </div>
          <Link
            href="/raport/i-ri"
            className="flex items-center gap-1 bg-[#1D9E75] hover:bg-[#17836B] text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Raport +
          </Link>
        </div>

        {/* Category filter pills */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 overflow-x-auto flex gap-2 bg-white dark:bg-gray-900">
          <Link
            href="/lista"
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Të gjitha
          </Link>
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <Link
              key={key}
              href={`/lista?category=${key}`}
              className="flex-shrink-0 flex items-center gap-1 text-xs px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity"
              style={{ backgroundColor: cat.color + '20', color: cat.color }}
            >
              <span>{cat.emoji}</span>
              <span className="hidden sm:inline">{cat.label}</span>
            </Link>
          ))}
        </div>

        {/* Reports list */}
        <div className="flex-1 overflow-y-auto">
          {latestReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 p-8 text-center">
              <span className="text-5xl mb-4">📋</span>
              <p className="font-medium">Nuk ka raporte ende</p>
              <p className="text-sm mt-1">Bëhu i pari që raporton një problem!</p>
              <Link
                href="/raport/i-ri"
                className="mt-4 bg-[#1D9E75] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#17836B] transition-colors"
              >
                Raporto tani
              </Link>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {latestReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
              {reports.length > 10 && (
                <Link
                  href="/lista"
                  className="block text-center text-sm text-[#1D9E75] hover:underline py-4"
                >
                  Shiko të gjitha {reports.length} raportet →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right panel: map (desktop) */}
      <div className="hidden md:block md:flex-1 relative">
        <ReportMap reports={reports} height="100%" />
        {/* FAB on desktop */}
        <Link
          href="/raport/i-ri"
          className="absolute bottom-6 right-6 z-10 flex items-center gap-2 bg-[#1D9E75] hover:bg-[#17836B] text-white font-semibold px-5 py-3 rounded-full shadow-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          Raport +
        </Link>
      </div>
    </div>
  )
}
