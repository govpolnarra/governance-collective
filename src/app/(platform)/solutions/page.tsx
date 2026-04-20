import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Solution } from '@/lib/types/database'

export default async function SolutionsPage() {
  const supabase = await createClient()
  const { data: solutions } = await supabase
    .from('solutions')
    .select('*, profiles(full_name, organisation)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Solutions</h1>
          <p className="text-slate-500 mt-1">Innovative approaches to governance challenges.</p>
        </div>
        <Link href="/solutions/submit" className="btn-primary">+ Submit a Solution</Link>
      </div>
      {!solutions || solutions.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-400 text-lg mb-2">No solutions published yet.</p>
          <p className="text-slate-400 text-sm mb-4">Be the first to share an approach that worked.</p>
          <Link href="/solutions/submit" className="btn-primary mt-4 inline-block">Submit a Solution</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(solutions as Solution[]).map((s) => (
            <Link key={s.id} href={`/solutions/${s.id}`} className="card p-5 hover:shadow-md transition-shadow block">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs uppercase tracking-wide text-blue-700 font-semibold">{s.sector}</span>
              </div>
              <h2 className="font-semibold text-slate-900 mt-1 mb-2 line-clamp-2">{s.name}</h2>
              <p className="text-sm text-slate-500 line-clamp-3 mb-3">{s.description}</p>
              {s.tags && s.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {s.tags.map((t: string) => (
                    <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-400">
                By {(s as any).profiles?.full_name ?? 'Unknown'}
                {(s as any).profiles?.organisation ? ` · ${(s as any).profiles.organisation}` : ''}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
