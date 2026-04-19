'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/dashboard', label: 'Home' },
  { href: '/playbooks', label: 'Playbooks' },
  { href: '/solutions', label: 'Solutions' },
  { href: '/requests', label: 'Requests' },
  { href: '/learning', label: 'Learning' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center h-14 gap-6">
        <Link href="/dashboard" className="font-semibold text-ink text-sm tracking-tight">
          Governance Collective
        </Link>
        <div className="flex gap-1 flex-1">
          {links.map(({ href, label }) => (
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
        </div>
        <Link href="/profile" className="text-sm text-slate-500 hover:text-ink">Profile</Link>
      </div>
    </nav>
  )
}
