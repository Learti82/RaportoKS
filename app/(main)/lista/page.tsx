import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ReportCard } from '@/components/reports/ReportCard'
import { Skeleton } from '@/components/ui/skeleton'
import { CATEGORIES, STATUS_LABELS, MUNICIPALITIES } from '@/lib/constants'
import Link from 'next/link'
import type { Report } from '@/lib/types'

interface SearchParams {
  category?: string
  status?: string
  municipality?: string
  sort?: string
  page?: string
}

async function getReports(searchParams: SearchParams): Promise<{ reports: Report[]; total: number }> {
  try {
    const supabase = createClient()
    const limit = 12
    const page = parseInt(searchParams.page || '1')
    const offset = (page - 1) * limit

    let query = supabase.from('reports').select('*', { count: 'exact' })
    if (searchParams.category) query = query.eq('category', searchParams.category)
    if (searchParams.status) query = query.eq('status', searchParams.status)
    if (searchParams.municipality) query = query.eq('municipality', searchParams.municipality)
    if (searchParams.sort === 'upvotes') {
      query = query.order('upvotes', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }
    query = query.range(offset, offset + limit - 1)

    const { data, count } = await query
    return { reports: data || [], total: count || 0 }
  } catch {
    return { reports: [], total: 0 }
  }
}

function FilterBar({ searchParams }: { searchParams: SearchParams }) {
  const buildUrl = (key: string, value: string) => {
    const params = new URLSearchParams()
    if (searchParams.category && key !== 'category') params.set('category', searchParams.category)
    if (searchParams.status && key !== 'status') params.set('status', searchParams.status)
    if (searchParams.municipality && key !== 'municipality') params.set('municipality', searchParams.municipality)
    if (searchParams.sort && key !== 'sort') params.set('sort', searchParams.sort)
    if (value) params.set(key, value)
    const q = params.toString()
    return `/lista${q ? '?' + q : ''}`
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-medium text-gray-500 self-center mr-1">Kategoria:</span>
        <Link href="/lista" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!searchParams.category ? 'bg-[#1D9E75] text-white border-[#1D9E75]' : 'border-gray-200 hover:border-gray-300'}`}>
          Të gjitha
        </Link>
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <Link
            key={key}
            href={buildUrl('category', key)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1 ${searchParams.category === key ? 'text-white border-transparent' : 'border-gray-200 hover:border-gray-300'}`}
            style={searchParams.category === key ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
          >
            {cat.emoji} {cat.label}
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-medium text-gray-500 self-center mr-1">Statusi:</span>
        {Object.entries(STATUS_LABELS).map(([key, s]) => (
          <Link
            key={key}
            href={buildUrl('status', key)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${searchParams.status === key ? 'font-semibold' : 'border-gray-200'}`}
            style={searchParams.status === key ? { color: s.color, backgroundColor: s.bg, borderColor: s.color } : {}}
          >
            {s.label}
          </Link>
        ))}
      </div>
      <div className="flex gap-2">
        <span className="text-xs font-medium text-gray-500 self-center mr-1">Rendit:</span>
        <Link href={buildUrl('sort', 'newest')} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!searchParams.sort || searchParams.sort === 'newest' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white' : 'border-gray-200'}`}>
          Më të reja
        </Link>
        <Link href={buildUrl('sort', 'upvotes')} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${searchParams.sort === 'upvotes' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white' : 'border-gray-200'}`}>
          Më shumë vota
        </Link>
      </div>
    </div>
  )
}

export default async function ListaPage({ searchParams }: { searchParams: SearchParams }) {
  const { reports, total } = await getReports(searchParams)
  const page = parseInt(searchParams.page || '1')
  const totalPages = Math.ceil(total / 12)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Të gjitha raportet</h1>
          <p className="text-gray-500 text-sm mt-1">{total} raporte gjithsej</p>
        </div>
        <FilterBar searchParams={searchParams} />
        <div className="px-4 py-6">
          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <span className="text-6xl mb-4">🔍</span>
              <p className="font-medium text-lg">Nuk u gjet asnjë raport</p>
              <p className="text-sm mt-2">Provo të ndryshosh filtrat</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {reports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const params = new URLSearchParams()
                    if (searchParams.category) params.set('category', searchParams.category)
                    if (searchParams.status) params.set('status', searchParams.status)
                    if (searchParams.sort) params.set('sort', searchParams.sort)
                    params.set('page', String(p))
                    return (
                      <Link
                        key={p}
                        href={`/lista?${params.toString()}`}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${page === p ? 'bg-[#1D9E75] text-white' : 'bg-white border border-gray-200 hover:border-gray-300'}`}
                      >
                        {p}
                      </Link>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
