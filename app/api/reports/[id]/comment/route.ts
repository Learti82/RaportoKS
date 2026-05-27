import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await currentUser()
  const { content } = await request.json()

  if (!content || content.trim().length < 2) {
    return NextResponse.json({ error: 'Komenti është shumë i shkurtër' }, { status: 400 })
  }

  const isAdmin = (sessionClaims as any)?.metadata?.role === 'admin'
  const authorName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.username || 'Anonim'

  const supabase = await createClient()
  const { data, error } = await supabase.from('report_comments').insert({
    report_id: params.id,
    clerk_user_id: userId,
    author_name: authorName,
    content: content.trim(),
    is_official: isAdmin,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
