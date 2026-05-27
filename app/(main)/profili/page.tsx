import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileClient } from './ProfileClient'

export default async function ProfilePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const supabase = await createClient()

  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .eq('reporter_clerk_id', userId)
    .order('created_at', { ascending: false })

  const myReports = reports || []
  const resolvedCount = myReports.filter((r) => r.status === 'zgjidhur').length
  const totalUpvotes = myReports.reduce((acc, r) => acc + (r.upvotes || 0), 0)

  return (
    <ProfileClient
      user={{
        id: user?.id || userId,
        name: user?.firstName && user?.lastName
          ? `${user.firstName} ${user.lastName}`
          : user?.username || 'Anonim',
        imageUrl: user?.imageUrl,
        email: user?.emailAddresses?.[0]?.emailAddress,
      }}
      reports={myReports}
      stats={{ total: myReports.length, resolved: resolvedCount, upvotes: totalUpvotes }}
    />
  )
}
