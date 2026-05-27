'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Map, Plus, BarChart3, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Kryefaqja', icon: Home },
  { href: '/harta', label: 'Harta', icon: Map },
  { href: '/raport/i-ri', label: 'Raport', icon: Plus, primary: true },
  { href: '/statistika', label: 'Statistika', icon: BarChart3 },
  { href: '/profili', label: 'Profili', icon: User },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 safe-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-4"
              >
                <div className="w-14 h-14 rounded-full bg-[#1D9E75] flex items-center justify-center shadow-lg">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-[10px] mt-0.5 text-[#1D9E75] font-medium">{item.label}</span>
              </Link>
            )
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full',
                isActive ? 'text-[#1D9E75]' : 'text-gray-400'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
