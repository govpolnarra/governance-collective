import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const STATUS_BADGE: Record<string, string> = {
  pending_review: 'bg-yellow-100 text-yellow-700',
  published: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  draft: 'bg-slate-100 text-slate-500',
  open: 'bg-emerald-100 text-emerald-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-slate-100 text-slate-500',
  closed: 'bg-slate-100 text-slate-400',
}

export default async function MySubmissionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: playbooks }, { data: solutions }, { data: learning }, { data: requests }] =
    await Promise.all([
      supabase.from('playbooks').select('id, title, status, created_at').eq('author_id', user.id).order('created_at', { ascending: false }),
      supabase.from('solutions').select('id, name, status, created_at').eq('author_id', user.id).order('created_at', { ascending: false }),
      supabase.from('learning_resources').select('id, title, status, created_at').eq('author_id', user.id).order('created_at', { ascending: false }),
      supabase.from('requests').select('id, title, status, created_at').eq('author_id', user.id).order('created_at', { ascending: false }),
    ])

  const hasAny = (playbooks?.length ?? 0) + (solutions?.length ?? 0) + (learning?.length ?? 0) + (requests?.length ?? 0) > 0

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Submissions</h1>
          <p className="text-slate-500 mt-1 text-sm">Track the status of everything you've contributed.</p>
        </div>
      </div>

      {!hasAny && (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">📤</p>
          <p className="text-lg font-medium text-slate-700">No submissions yet</p>
          <p className="text-slate-400 text-sm mt-1 mb-4">Start contributing to the platform.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/playbooks/submit" className="btn-primary">Submit a Playbook</Link>
            <Link href="/solutions/submit" className="btn-secondary">Submit a Solution</Link>
            <Link href="/learning/submit" className="btn-secondary">Submit a Resource</Link>
            <Link href="/requests/submit" className="btn-secondary">Post a Request</Link>
          </div>
        </div>
      )}

      {(playbooks?.length ?? 0) > 0 && (
        <Section title="📚 Playbooks" items={playbooks!.map(p => ({ id: p.id, title: p.title, status: p.status, created_at: p.created_at, href: `/playbooks/${p.id}` }))} />
      )}

      {(solutions?.length ?? 0) > 0 && (
        <Section title="✅ Solutions" items={solutions!.map(s => ({ id: s.id, title: s.name, status: s.status, created_at: s.created_at, href: `/solutions/${s.id}` }))} />
      )}

      {(learning?.length ?? 0) > 0 && (
        <Section title="🎓 Learning Resources" items={learning!.map(l => ({ id: l.id, title: l.title, status: l.status, created_at: l.created_at, href: `/learning/${l.id}` }))} />
      )}

      {(requests?.length ?? 0) > 0 && (
        <Section title="📌 Requests" items={requests!.map(r => ({ id: r.id, title: r.title, status: r.status, created_at: r.created_at, href: `/requests/${r.id}` }))} />
      )}
    </div>
  )
}

function Section({ title, items }: {
  title: string
  items: { id: string; title: string; status: string; created_at: string; href: string }[]
}) {
  return (
    <div className="mb-8">
      <h2 className="text-base font-semibold text-slate-700 mb-3">{title}</h2>
      <div className="card divide-y divide-slate-100">
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-between px-5 py-3">
            <Link href={item.href} className="text-sm text-slate-800 hover:text-brand-600 font-medium truncate max-w-xs">
              {item.title}
            </Link>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${STATUS_BADGE[item.status] ?? 'bg-slate-100 text-slate-500'}`}>
                {item.status?.replace(/_/g, ' ')}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
