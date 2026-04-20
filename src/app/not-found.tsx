import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <p className="text-6xl mb-4">🔍</p>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Page not found</h1>
        <p className="text-slate-500 mb-6">This page doesn't exist or you may not have access to it.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard" className="btn-primary">Go to Dashboard</Link>
          <Link href="/login" className="btn-secondary">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
