import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, organisation')
    .eq('id', user.id)
    .single()

  const { count: playbookCount } = await supabase
    .from('playbooks')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  const { count: solutionCount } = await supabase
    .from('solutions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  const { count: requestCount } = await supabase
    .from('requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open')

  const { count: learningCount } = await supabase
    .from('learning_resources')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  const isCurator = ['curator', 'admin'].includes(profile?.role ?? '')
  let queueCount = 0
  if (isCurator) {
    const { count } = await supabase
      .from('curation_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_review')
    queueCount = count ?? 0
  }

  const stats = [
    { label: 'Playbooks', count: playbookCount ?? 0, href: '/playbooks', cta: 'Browse' },
    { label: 'Solutions', count: solutionCount ?? 0, href: '/solutions', cta: 'Explore' },
    { label: 'Open Requests', count: requestCount ?? 0, href: '/requests', cta: 'View' },
    { label: 'Learning Resources', count: learningCount ?? 0, href: '/learning', cta: 'Learn' },
  ]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''} 👋
        </h1>
        <p className="text-slate-500 mt-1">
          {profile?.organisation ? `${profile.organisation} · ` : ''}
          <span className="capitalize font-medium text-emerald-700">{profile?.role ?? 'member'}</span>
        </p>
      </div>

      {isCurator && queueCount > 0 && (
        <Link
          href="/curation"
          className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 hover:bg-amber-100 transition-colors"
        >
          <div>
            <p className="font-semibold text-amber-800">Curation Queue</p>
            <p className="text-sm text-amber-600">{queueCount} submission{queueCount !== 1 ? 's' : ''} pending your review</p>
          </div>
          <span className="text-amber-700 font-semibold">Review →</span>
        </Link>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{s.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1 mb-3">{s.count}</p>
            <Link href={s.href} className="text-xs text-emerald-600 hover:underline mt-auto">{s.cta} →</Link>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-3">Contribute</h2>
          <div className="space-y-2">
            <Link href="/playbooks/submit" className="flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-700 hover:underline">
              <span>📋</span> Submit a Playbook
            </Link>
            <Link href="/solutions/submit" className="flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-700 hover:underline">
              <span>💡</span> List a Solution
            </Link>
            <Link href="/learning/submit" className="flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-700 hover:underline">
              <span>📚</span> Share a Learning Resource
            </Link>
            <Link href="/requests/submit" className="flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-700 hover:underline">
              <span>❓</span> Post a Request
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-3">Your Account</h2>
          <div className="space-y-2">
            <Link href="/profile" className="flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-700 hover:underline">
              <span>👤</span> Edit Profile
            </Link>
            {isCurator && (
              <Link href="/curation" className="flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-700 hover:underline">
                <span>✨</span> Curation Queue {queueCount > 0 && <span className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full">{queueCount}</span>}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
