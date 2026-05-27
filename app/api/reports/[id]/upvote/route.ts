import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createClient()
  const reportId = params.id

  const { data: existing } = await supabase
    .from('report_upvotes')
    .select('id')
    .eq('report_id', reportId)
    .eq('clerk_user_id', userId)
    .single()

  if (existing) {
    await supabase.from('report_upvotes').delete().eq('id', existing.id)
    await supabase.rpc('decrement_upvotes', { report_id: reportId })
    return NextResponse.json({ upvoted: false })
  } else {
    await supabase.from('report_upvotes').insert({ report_id: reportId, clerk_user_id: userId })
    await supabase.rpc('increment_upvotes', { report_id: reportId })
    return NextResponse.json({ upvoted: true })
  }
}
