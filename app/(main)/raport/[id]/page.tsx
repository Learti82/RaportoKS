import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReportDetailClient } from './ReportDetailClient'

async function getReport(id: string) {
  try {
    const supabase = await createClient()
    const { data: report } = await supabase.from('reports').select('*').eq('id', id).single()
    if (!report) return null

    await supabase.from('reports').update({ views: report.views + 1 }).eq('id', id)

    const [{ data: comments }, { data: history }] = await Promise.all([
      supabase.from('report_comments').select('*').eq('report_id', id).order('created_at'),
      supabase.from('status_history').select('*').eq('report_id', id).order('created_at'),
    ])

    return { ...report, comments: comments || [], history: history || [] }
  } catch {
    return null
  }
}

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  const report = await getReport(params.id)
  if (!report) notFound()

  return <ReportDetailClient report={report} />
}
