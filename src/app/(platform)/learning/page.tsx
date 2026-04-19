import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function LearningPage() {
  const supabase = await createServerClient()
  const { data: logs } = await supabase
    .from('learning_logs')
    .select('*, profiles(full_name)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-ink">Learning</h1>
        <Link href="/learning/submit" className="btn-primary">Share a Learning</Link>
      </div>
      <p className="text-slate-500 mb-8">Capsules on working with government — insights, mistakes, and lessons from the field.</p>
      {!logs || logs.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-400 text-lg">No learning capsules yet.</p>
          <Link href="/learning/submit" className="btn-primary mt-4 inline-block">Share a Learning</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {logs.map((l: any) => (
            <div key={l.id} className="card p-5">
              <span className="text-xs uppercase tracking-wide text-primary font-semibold">{l.type}</span>
              <h2 className="font-semibold text-ink mt-1 mb-2">{l.title}</h2>
              <p className="text-sm text-slate-500 line-clamp-3">{l.body}</p>
              <p className="text-xs text-slate-400 mt-3">By {l.profiles?.full_name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
