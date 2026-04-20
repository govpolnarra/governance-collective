'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

const mainLinks = [
  { href: '/dashboard', label: 'Home' },
  { href: '/playbooks', label: 'Playbooks' },
  { href: '/solutions', label: 'Solutions' },
  { href: '/requests', label: 'Requests' },
  { href: '/learning', label: 'Learning' },
  { href: '/bookmarks', label: 'Bookmarks' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserClient()
  const [role, setRole] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setRole(data.role)
            setUserName(data.full_name ?? '')
          }
        })
    })
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isCuratorOrAdmin = role === 'curator' || role === 'admin'

  return (
    <aside className="w-56 shrink-0 h-screen sticky top-0 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white font-bold text-sm">GC</div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">Governance Collective</p>
            <p className="text-xs text-gray-400">Phase 1</p>
          </div>
        </Link>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {mainLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === link.href
                ? 'bg-green-50 text-green-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {link.label}
          </Link>
        ))}

        {/* Curation link — curators/admins only */}
        {isCuratorOrAdmin && (
          <Link
            href="/curation"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname.startsWith('/curation')
                ? 'bg-green-50 text-green-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-semibold">CUR</span>
            Curation Queue
          </Link>
        )}
      </nav>

      {/* User + sign out */}
      <div className="px-3 py-4 border-t border-gray-100">
        <Link
          href="/profile"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors mb-1"
        >
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold shrink-0">
            {userName ? userName[0].toUpperCase() : 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-800 truncate">{userName || 'User'}</p>
            <p className="text-xs text-gray-400 capitalize">{role || 'Member'}</p>
          </div>
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full text-left px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
