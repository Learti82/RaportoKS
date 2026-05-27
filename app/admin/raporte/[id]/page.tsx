import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminReportManager } from './AdminReportManager'

async function getReport(id: string) {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('reports').select('*').eq('id', id).single()
    return data
  } catch {
    return null
  }
}

export default async function AdminReportPage({ params }: { params: { id: string } }) {
  const report = await getReport(params.id)
  if (!report) notFound()
  return <AdminReportManager report={report} />
}
