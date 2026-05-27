'use client'

import { useEffect, useState, useRef } from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES, STATUS_LABELS } from '@/lib/constants'
import { StatusBadge } from '@/components/reports/StatusBadge'
import type { Report } from '@/lib/types'

function AnimatedCount({ target }: { target: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) return
    let start = 0
    const step = Math.ceil(target / 60)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(start)
    }, 16)
    return () => clearInterval(timer)
  }, [target])
  return <span>{count.toLocaleString()}</span>
}

export function StatsDashboard({ reports: initialReports }: { reports: Report[] }) {
  const [reports, setReports] = useState(initialReports)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('reports-count')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reports' }, (payload) => {
        setReports((prev) => [payload.new as Report, ...prev])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const total = reports.length
  const resolved = reports.filter((r) => r.status === 'zgjidhur').length
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0

  const resolvedWithTime = reports.filter((r) => r.status === 'zgjidhur' && r.resolved_at)
  const avgDays = resolvedWithTime.length > 0
    ? Math.round(resolvedWithTime.reduce((acc, r) => {
        const diff = new Date(r.resolved_at!).getTime() - new Date(r.created_at).getTime()
        return acc + diff / (1000 * 60 * 60 * 24)
      }, 0) / resolvedWithTime.length)
    : 0

  // By status
  const statusData = Object.entries(STATUS_LABELS).map(([key, s]) => ({
    name: s.label,
    value: reports.filter((r) => r.status === key).length,
    color: s.color,
  })).filter((d) => d.value > 0)

  // By category
  const categoryData = Object.entries(CATEGORIES).map(([key, cat]) => ({
    name: cat.label,
    emoji: cat.emoji,
    value: reports.filter((r) => r.category === key).length,
    color: cat.color,
  })).filter((d) => d.value > 0).sort((a, b) => b.value - a.value)

  // By municipality
  const municipalityMap: Record<string, number> = {}
  reports.forEach((r) => {
    municipalityMap[r.municipality] = (municipalityMap[r.municipality] || 0) + 1
  })
  const municipalityData = Object.entries(municipalityMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }))

  // Last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const last30 = reports.filter((r) => new Date(r.created_at) >= thirtyDaysAgo)
  const byDay: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    byDay[key] = 0
  }
  last30.forEach((r) => {
    const key = r.created_at.split('T')[0]
    if (byDay[key] !== undefined) byDay[key]++
  })
  const lineData = Object.entries(byDay).map(([date, count]) => ({
    date: date.slice(5),
    count,
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Statistikat</h1>
        <p className="text-gray-500 text-sm mt-1">Pasqyrë publike e raporteve civile në Kosovë</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Gjithsej raporte', value: total, emoji: '📋' },
          { label: 'Të zgjidhura', value: resolved, emoji: '✅' },
          { label: 'Norma zgjidhjes', value: `${resolutionRate}%`, emoji: '📊', noAnim: true },
          { label: 'Ditë mesi zgjidhje', value: avgDays, emoji: '⏱️' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 text-center">
            <div className="text-3xl mb-2">{kpi.emoji}</div>
            <div className="text-3xl font-bold text-[#1D9E75]">
              {kpi.noAnim ? kpi.value : <AnimatedCount target={Number(kpi.value)} />}
            </div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status donut */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Sipas statusit</h3>
          {statusData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {statusData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-gray-600 dark:text-gray-400">{d.name}</span>
                    </div>
                    <span className="font-semibold">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-gray-400 text-sm text-center py-8">Nuk ka të dhëna</p>}
        </div>

        {/* Category bars */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Sipas kategorisë</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData} layout="vertical" margin={{ left: 8 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm text-center py-8">Nuk ka të dhëna</p>}
        </div>
      </div>

      {/* Line chart */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Raportet — 30 ditët e fundit</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#1D9E75" strokeWidth={2} dot={false} name="Raporte" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Municipality chart */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top 10 komunat</h3>
        {municipalityData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={municipalityData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#1D9E75" radius={[4, 4, 0, 0]} name="Raporte" />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-gray-400 text-sm text-center py-8">Nuk ka të dhëna</p>}
      </div>
    </div>
  )
}
