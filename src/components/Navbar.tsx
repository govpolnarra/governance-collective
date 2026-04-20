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
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserClient()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setRole(data.role)
        })
    })
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center h-14 gap-6">
        <Link href="/dashboard" className="font-semibold text-ink text-sm tracking-tight">
          Governance Collective
        </Link>
        <div className="flex gap-1 flex-1">
          {mainLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                pathname?.startsWith(href)
                  ? 'bg-slate-100 text-ink'
                  : 'text-slate-500 hover:text-ink hover:bg-slate-50'
              }`}
            >
              {label}
            </Link>
          ))}
          {(role === 'curator' || role === 'admin') && (
            <Link
              href="/curation"
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                pathname?.startsWith('/curation')
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
              }`}
            >
              Curation
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/profile" className="text-sm text-slate-500 hover:text-ink">Profile</Link>
          <button
            onClick={handleSignOut}
            className="text-sm text-slate-400 hover:text-red-500 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
