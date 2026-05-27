'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import { MapPin, BarChart3, List, Plus, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Kryefaqja' },
  { href: '/harta', label: 'Harta' },
  { href: '/lista', label: 'Lista' },
  { href: '/statistika', label: 'Statistika' },
]

export function Navbar() {
  const pathname = usePathname()
  const { isSignedIn } = useUser()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <MapPin className="h-5 w-5 text-[#1D9E75]" />
          <span className="text-[#1D9E75]">Raport</span>
          <span className="text-gray-900 dark:text-white">KS</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'text-[#1D9E75]'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/raport/i-ri"
            className="hidden md:flex items-center gap-1.5 bg-[#1D9E75] hover:bg-[#17836B] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Raport +
          </Link>

          {isSignedIn ? (
            <UserButton />
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                  Hyr
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors">
                  Regjistrohu
                </button>
              </SignUpButton>
            </div>
          )}

          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'block text-sm font-medium py-2',
                pathname === link.href ? 'text-[#1D9E75]' : 'text-gray-600 dark:text-gray-300'
              )}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/raport/i-ri"
            className="flex items-center gap-1.5 bg-[#1D9E75] text-white text-sm font-medium px-4 py-2 rounded-lg w-full justify-center"
            onClick={() => setMenuOpen(false)}
          >
            <Plus className="h-4 w-4" />
            Raport +
          </Link>
          {!isSignedIn && (
            <div className="flex gap-2 pt-2">
              <SignInButton mode="modal">
                <button className="flex-1 text-sm font-medium border border-gray-200 py-2 rounded-lg">Hyr</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="flex-1 text-sm font-medium bg-gray-100 py-2 rounded-lg">Regjistrohu</button>
              </SignUpButton>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
