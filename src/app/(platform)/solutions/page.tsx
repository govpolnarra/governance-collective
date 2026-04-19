import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function SolutionsPage() {
  const supabase = await createServerClient()
  const { data: solutions } = await supabase
    .from('solution_profiles')
    .select('*, profiles(full_name)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-ink">Solutions</h1>
        <Link href="/solutions/submit" className="btn-primary">List a Solution</Link>
      </div>
      <p className="text-slate-500 mb-8">Validated programmes and tools for government challenges.</p>
      {!solutions || solutions.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-400 text-lg">No solutions listed yet.</p>
          <Link href="/solutions/submit" className="btn-primary mt-4 inline-block">List a Solution</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {solutions.map((s: any) => (
            <div key={s.id} className="card p-5">
              <span className="text-xs uppercase tracking-wide text-primary font-semibold">{s.sector}</span>
              <h2 className="font-semibold text-ink mt-1 mb-2">{s.name}</h2>
              <p className="text-sm text-slate-500 line-clamp-2">{s.description}</p>
              <div className="flex gap-2 mt-3">
                {s.tags?.map((t: string) => (
                  <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
