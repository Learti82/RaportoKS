import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { NewReportForm } from './NewReportForm'

export default async function NewReportPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Raporto një problem</h1>
          <p className="text-gray-500 mt-1 text-sm">Ndihmo komunitetin tënd duke raportuar problemet urbane</p>
        </div>
        <NewReportForm />
      </div>
    </div>
  )
}
