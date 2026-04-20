import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Playbook } from '@/lib/types/database'

export default async function PlaybooksPage() {
  const supabase = await createClient()
  const { data: playbooks } = await supabase
    .from('playbooks')
    .select('*, profiles(full_name, organisation)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Playbooks</h1>
          <p className="text-slate-500 mt-1">Field-tested methods and frameworks from government practitioners.</p>
        </div>
        <Link href="/playbooks/submit" className="btn-primary">+ Submit a Playbook</Link>
      </div>
      {!playbooks || playbooks.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-400 text-lg mb-2">No playbooks published yet.</p>
          <p className="text-slate-400 text-sm mb-4">Be the first to contribute field knowledge.</p>
          <Link href="/playbooks/submit" className="btn-primary mt-4 inline-block">Submit a Playbook</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(playbooks as Playbook[]).map((p) => (
            <Link key={p.id} href={`/playbooks/${p.id}`} className="card p-5 hover:shadow-md transition-shadow block">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">{p.sector}</span>
                {p.state && <span className="text-xs text-slate-400">{p.state}</span>}
              </div>
              <h2 className="font-semibold text-slate-900 mt-1 mb-2 line-clamp-2">{p.title}</h2>
              <p className="text-sm text-slate-500 line-clamp-3 mb-3">{p.summary}</p>
              {p.tags && p.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {p.tags.map((t: string) => (
                    <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-400">
                By {(p as any).profiles?.full_name ?? 'Unknown'}
                {(p as any).profiles?.organisation ? ` · ${(p as any).profiles.organisation}` : ''}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
