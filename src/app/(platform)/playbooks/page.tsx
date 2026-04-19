import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function PlaybooksPage() {
  const supabase = await createServerClient()
  const { data: playbooks } = await supabase
    .from('playbooks')
    .select('*, profiles(full_name)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-ink">Playbooks</h1>
        <Link href="/playbooks/submit" className="btn-primary">
          Submit a Playbook
        </Link>
      </div>
      <p className="text-slate-500 mb-8">Field-tested methods and frameworks from government practitioners.</p>
      {!playbooks || playbooks.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-400 text-lg">No playbooks yet. Be the first to contribute!</p>
          <Link href="/playbooks/submit" className="btn-primary mt-4 inline-block">Submit a Playbook</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {playbooks.map((p: any) => (
            <div key={p.id} className="card p-5">
              <span className="text-xs uppercase tracking-wide text-primary font-semibold">{p.sector}</span>
              <h2 className="font-semibold text-ink mt-1 mb-2">{p.title}</h2>
              <p className="text-sm text-slate-500 line-clamp-2">{p.summary}</p>
              <p className="text-xs text-slate-400 mt-3">By {p.profiles?.full_name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
