import { createClient } from '@/lib/supabase/server'
import { StatsDashboard } from './StatsDashboard'
import type { Report } from '@/lib/types'

async function getStatsData() {
  try {
    const supabase = createClient()
    const { data: reports } = await supabase.from('reports').select('*').order('created_at', { ascending: false })
    return reports || []
  } catch {
    return []
  }
}

export default async function StatistikaPage() {
  const reports = await getStatsData()
  return <StatsDashboard reports={reports} />
}
