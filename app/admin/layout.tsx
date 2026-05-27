import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect('/sign-in')
  const isAdmin = (sessionClaims as any)?.metadata?.role === 'admin'
  if (!isAdmin) redirect('/')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-bold text-[#1D9E75]">← RaportoKS</Link>
          <span className="text-gray-300">|</span>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Admin Panel</span>
        </div>
        <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">Paneli kryesor</Link>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}
