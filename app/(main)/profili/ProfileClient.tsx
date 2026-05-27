'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { ReportCard } from '@/components/reports/ReportCard'
import { StatusBadge } from '@/components/reports/StatusBadge'
import { STATUS_LABELS, StatusKey } from '@/lib/constants'
import type { Report } from '@/lib/types'

interface ProfileClientProps {
  user: {
    id: string
    name: string
    imageUrl?: string
    email?: string
  }
  reports: Report[]
  stats: { total: number; resolved: number; upvotes: number }
}

export function ProfileClient({ user, reports, stats }: ProfileClientProps) {
  const [filter, setFilter] = useState<StatusKey | 'all'>('all')

  const filtered = filter === 'all' ? reports : reports.filter((r) => r.status === filter)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center gap-4">
          {user.imageUrl ? (
            <img src={user.imageUrl} alt={user.name} className="w-16 h-16 rounded-full" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#1D9E75] flex items-center justify-center text-white text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
            {user.email && <p className="text-sm text-gray-500">{user.email}</p>}
          </div>
          <UserButton />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          {[
            { label: 'Raporte', value: stats.total },
            { label: 'Të zgjidhura', value: stats.resolved },
            { label: 'Vota marrë', value: stats.upvotes },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-[#1D9E75]">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* My reports */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Raportet e mia</h2>
          <Link href="/raport/i-ri" className="text-sm text-[#1D9E75] hover:underline">+ Raport i ri</Link>
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filter === 'all' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white' : 'border-gray-200 hover:border-gray-300'}`}
          >
            Të gjitha ({reports.length})
          </button>
          {Object.entries(STATUS_LABELS).map(([key, s]) => {
            const count = reports.filter((r) => r.status === key).length
            if (count === 0) return null
            return (
              <button
                key={key}
                onClick={() => setFilter(key as StatusKey)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filter === key ? 'font-semibold' : 'border-gray-200'}`}
                style={filter === key ? { color: s.color, backgroundColor: s.bg, borderColor: s.color } : {}}
              >
                {s.label} ({count})
              </button>
            )
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="text-4xl block mb-3">📋</span>
            <p>Nuk ke raporte ende</p>
            <Link href="/raport/i-ri" className="text-sm text-[#1D9E75] hover:underline mt-2 block">
              Raporto problemin e parë
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((r) => <ReportCard key={r.id} report={r} />)}
          </div>
        )}
      </div>
    </div>
  )
}
