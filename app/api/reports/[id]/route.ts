import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: report, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !report) {
    return NextResponse.json({ error: 'Raporti nuk u gjet' }, { status: 404 })
  }

  await supabase.from('reports').update({ views: report.views + 1 }).eq('id', params.id)

  const [{ data: comments }, { data: history }] = await Promise.all([
    supabase.from('report_comments').select('*').eq('report_id', params.id).order('created_at'),
    supabase.from('status_history').select('*').eq('report_id', params.id).order('created_at'),
  ])

  return NextResponse.json({ ...report, comments: comments || [], history: history || [] })
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const supabase = await createClient()

  const { data: report } = await supabase.from('reports').select('*').eq('id', params.id).single()
  if (!report) return NextResponse.json({ error: 'Raporti nuk u gjet' }, { status: 404 })

  if (report.reporter_clerk_id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (report.status !== 'raportuar') {
    return NextResponse.json({ error: 'Raporti nuk mund të ndryshohet pas shqyrtimit' }, { status: 400 })
  }

  const { title, description, photo_url, photo_path } = body
  const { data, error } = await supabase
    .from('reports')
    .update({ title, description, photo_url, photo_path, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
