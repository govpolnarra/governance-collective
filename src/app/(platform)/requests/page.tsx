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
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Requests</h1>
          <p className="text-slate-500 mt-1">Open requests from the governance community.</p>
        </div>
        <Link href="/requests/submit" className="btn-primary">+ New Request</Link>
      </div>
      {!requests || requests.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-400 text-lg mb-2">No requests yet.</p>
          <p className="text-slate-400 text-sm mb-4">Start the conversation by posting a request.</p>
          <Link href="/requests/submit" className="btn-primary mt-4 inline-block">New Request</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(requests as Request[]).map((r) => (
            <Link key={r.id} href={`/requests/${r.id}`} className="card p-5 hover:shadow-md transition-shadow block">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${STATUS_COLORS[r.status] || 'bg-slate-100 text-slate-600'}`}>
                  {r.status?.replace('_', ' ')}
                </span>
                {r.sector && <span className="text-xs text-slate-400">{r.sector}</span>}
              </div>
              <h2 className="font-semibold text-slate-900 mb-1">{r.title}</h2>
              <p className="text-sm text-slate-500 line-clamp-2">{r.description}</p>
              <p className="text-xs text-slate-400 mt-2">
                By {(r as any).profiles?.full_name ?? 'Unknown'}
                {(r as any).profiles?.organisation ? ` · ${(r as any).profiles.organisation}` : ''}
                {' · '}{new Date(r.created_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
