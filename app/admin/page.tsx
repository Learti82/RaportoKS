import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/reports/StatusBadge'
import { CategoryBadge } from '@/components/reports/CategoryBadge'
import { formatRelativeTime } from '@/lib/utils'
import type { Report } from '@/lib/types'

async function getAllReports(): Promise<Report[]> {
  try {
    const supabase = createClient()
    const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false })
    return data || []
  } catch {
    return []
  }
}

export default async function AdminPage() {
  const reports = await getAllReports()
  const raportuar = reports.filter((r) => r.status === 'raportuar').length
  const shqyrtim = reports.filter((r) => r.status === 'shqyrtim').length
  const ne_proces = reports.filter((r) => r.status === 'ne_proces').length
  const zgjidhur = reports.filter((r) => r.status === 'zgjidhur').length

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Raportuar', count: raportuar, color: '#888' },
          { label: 'Në Shqyrtim', count: shqyrtim, color: '#EF9F27' },
          { label: 'Në Proces', count: ne_proces, color: '#185FA5' },
          { label: 'Zgjidhur', count: zgjidhur, color: '#1D9E75' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold">Të gjitha raportet ({reports.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Titulli</th>
                <th className="text-left px-4 py-3">Kategoria</th>
                <th className="text-left px-4 py-3">Statusi</th>
                <th className="text-left px-4 py-3">Komuna</th>
                <th className="text-left px-4 py-3">Data</th>
                <th className="text-left px-4 py-3">Veprime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-[200px] truncate">{r.title}</td>
                  <td className="px-4 py-3"><CategoryBadge category={r.category} size="sm" /></td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} size="sm" /></td>
                  <td className="px-4 py-3 text-gray-500">{r.municipality}</td>
                  <td className="px-4 py-3 text-gray-400">{formatRelativeTime(r.created_at)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/raporte/${r.id}`} className="text-[#1D9E75] hover:underline text-xs font-medium">
                      Menaxho →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
