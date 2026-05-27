'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { StatusBadge } from '@/components/reports/StatusBadge'
import { CategoryBadge } from '@/components/reports/CategoryBadge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { STATUS_LABELS, StatusKey } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { Report } from '@/lib/types'

export function AdminReportManager({ report: initialReport }: { report: Report }) {
  const router = useRouter()
  const [report, setReport] = useState(initialReport)
  const [newStatus, setNewStatus] = useState<StatusKey>(report.status)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const handleStatusUpdate = async () => {
    if (newStatus === report.status) { toast.info('Nuk ndryshoi statusi'); return }
    setSaving(true)
    try {
      const res = await fetch(`/api/reports/${report.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note }),
      })
      if (!res.ok) throw new Error('Dështoi ndryshimi')
      const updated = await res.json()
      setReport((prev) => ({ ...prev, status: updated.status }))
      toast.success('Statusi u ndryshua')
      setNote('')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">← Kthehu</Link>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Menaxho Raportin</h1>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-4 space-y-3">
        {report.photo_url && (
          <img src={report.photo_url} alt={report.title} className="w-full h-48 object-cover rounded-lg" />
        )}
        <h2 className="font-bold text-lg text-gray-900 dark:text-white">{report.title}</h2>
        <div className="flex gap-2">
          <CategoryBadge category={report.category} />
          <StatusBadge status={report.status} />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{report.description}</p>
        <div className="text-xs text-gray-400 space-y-1">
          <p>📍 {report.address_text || report.municipality} — {report.municipality}</p>
          <p>👤 {report.reporter_name} — {report.reporter_email}</p>
          <p>📅 {formatDate(report.created_at)}</p>
          <p>❤️ {report.upvotes} vota | 👁️ {report.views} shikime</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Ndrysho statusin</h3>
        <Select value={newStatus} onValueChange={(v) => setNewStatus(v as StatusKey)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_LABELS).map(([key, s]) => (
              <SelectItem key={key} value={key}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Shto shënim opsional (do të shfaqet si koment zyrtar)..."
          className="min-h-[80px]"
        />
        <Button
          onClick={handleStatusUpdate}
          disabled={saving}
          className="bg-[#1D9E75] hover:bg-[#17836B] w-full"
        >
          {saving ? 'Duke ruajtur...' : 'Ruaj ndryshimet'}
        </Button>
        <Link
          href={`/raport/${report.id}`}
          className="block text-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
        >
          Shiko raportin publik →
        </Link>
      </div>
    </div>
  )
}
