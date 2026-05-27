import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const category = searchParams.get('category')
  const status = searchParams.get('status')
  const municipality = searchParams.get('municipality')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')
  const sort = searchParams.get('sort') || 'newest'

  let query = supabase.from('reports').select('*', { count: 'exact' })

  if (category) query = query.eq('category', category)
  if (status) query = query.eq('status', status)
  if (municipality) query = query.eq('municipality', municipality)

  if (sort === 'upvotes') {
    query = query.order('upvotes', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ reports: data, total: count })
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await currentUser()
  const body = await request.json()

  const { title, description, category, latitude, longitude, address_text, municipality, photo_url, photo_path } = body

  if (!title || !description || !category || !latitude || !longitude || !municipality) {
    return NextResponse.json({ error: 'Mungojnë fushat e detyrueshme' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.from('reports').insert({
    reporter_clerk_id: userId,
    reporter_name: user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.username || 'Anonim',
    reporter_email: user?.emailAddresses?.[0]?.emailAddress,
    title,
    description,
    category,
    latitude,
    longitude,
    address_text,
    municipality,
    photo_url,
    photo_path,
    status: 'raportuar',
  }).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
