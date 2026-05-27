import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = (sessionClaims as any)?.metadata?.role === 'admin'
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { status, note } = await request.json()
  const supabase = await createClient()

  const { data: report } = await supabase.from('reports').select('status').eq('id', params.id).single()
  if (!report) return NextResponse.json({ error: 'Raporti nuk u gjet' }, { status: 404 })

  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }
  if (status === 'zgjidhur') {
    updates.resolved_at = new Date().toISOString()
  }

  const [{ data, error }] = await Promise.all([
    supabase.from('reports').update(updates).eq('id', params.id).select().single(),
    supabase.from('status_history').insert({
      report_id: params.id,
      old_status: report.status,
      new_status: status,
      changed_by_clerk_id: userId,
      note,
    }),
  ])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
