import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'RaportoKS — Raporto Problemet Civile në Kosovë',
  description: 'Platforma civike për raportimin e problemeve urbane në Kosovë. Fotografo, raporto dhe monitorо zgjidhjen e problemeve.',
  keywords: 'Kosovë, raportim, probleme civile, rrugë, komunë',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="sq" suppressHydrationWarning>
        <head>
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        </head>
        <body className="antialiased">
          {children}
          <Toaster position="top-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  )
}
