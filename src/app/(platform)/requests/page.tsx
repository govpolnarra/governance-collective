import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Request } from '@/lib/types/database'

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-emerald-100 text-emerald-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-slate-100 text-slate-600',
  closed: 'bg-slate-100 text-slate-400',
}

export default async function RequestsPage() {
  const supabase = await createClient()
  const { data: requests } = await supabase
    .from('requests')
    .select('*, profiles(full_name, organisation)')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Requests</h1>
          <p className="text-slate-500 mt-1">Governance challenges seeking solutions, connections, or expertise.</p>
        </div>
        <Link href="/requests/submit" className="btn-primary">+ Post a Request</Link>
      </div>

      {!requests || requests.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-400 text-lg mb-2">No requests posted yet.</p>
          <Link href="/requests/submit" className="btn-primary mt-4 inline-block">Post a Request</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(requests as Request[]).map((r) => (
            <div key={r.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {r.sector && (
                      <span className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">{r.sector}</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[r.status] ?? STATUS_COLORS.open}`}>
                      {r.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="font-semibold text-slate-900 mb-1">{r.title}</h2>
                  <p className="text-sm text-slate-500 line-clamp-2">{r.description}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Posted by {(r as any).profiles?.full_name ?? 'Unknown'}
                {(r as any).profiles?.organisation ? ` · ${(r as any).profiles.organisation}` : ''}
                {' · '}{new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
