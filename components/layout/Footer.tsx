import Link from 'next/link'
import { MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <MapPin className="h-4 w-4 text-[#1D9E75]" />
            <span className="text-[#1D9E75]">Raport</span>
            <span>KS</span>
          </Link>
          <p className="text-sm text-gray-500">
            Platforma civike për raportimin e problemeve urbane në Kosovë
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="/lista" className="hover:text-gray-900 dark:hover:text-white transition-colors">Raportet</Link>
            <Link href="/harta" className="hover:text-gray-900 dark:hover:text-white transition-colors">Harta</Link>
            <Link href="/statistika" className="hover:text-gray-900 dark:hover:text-white transition-colors">Statistika</Link>
          </div>
        </div>
        <div className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} RaportoKS. Ndërtuar për qytetarët e Kosovës.
        </div>
      </div>
    </footer>
  )
}
