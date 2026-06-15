import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isCuratorRole, roleLabel } from '@/lib/access'
import { demoActionLabs, demoDistricts } from '@/lib/data/demo'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, organisation, access_tier')
    .eq('id', user.id)
    .single()

  const [{ count: playbookCount }, { count: solutionCount }, { count: requestCount }, { count: learningCount }, { count: districtCount }, { count: actionLabCount }] = await Promise.all([
    supabase
    .from('playbooks')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published'),
    supabase
    .from('solutions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published'),
    supabase
    .from('requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open'),
    supabase
    .from('learning_resources')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published'),
    supabase
    .from('districts')
    .select('*', { count: 'exact', head: true }),
    supabase
    .from('action_labs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active'),
  ])

  const isCurator = isCuratorRole(profile?.role)
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
    { label: 'Districts', count: districtCount ?? demoDistricts.length, href: '/districts', cta: 'Open' },
    { label: 'Action Labs', count: actionLabCount ?? demoActionLabs.length, href: '/action-labs', cta: 'Review' },
    { label: 'Learning Resources', count: learningCount ?? 0, href: '/learning', cta: 'Learn' },
  ]

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}
        </h1>
        <p className="text-slate-500 mt-1">
          {profile?.organisation ? `${profile.organisation} · ` : ''}
          <span className="capitalize font-medium text-emerald-700">{roleLabel(profile?.role)}</span>
          {profile?.access_tier ? <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{profile.access_tier}</span> : null}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-5 mb-6">
        <p className="text-xs uppercase tracking-wide font-semibold text-brand-700 mb-2">Source-of-truth search</p>
        <form action="/discover" className="flex flex-col sm:flex-row gap-3">
          <input name="q" className="input" placeholder="Search a problem, district, solution, sector, or evidence label..." />
          <button className="btn-primary sm:w-36" type="submit">Search</button>
        </form>
        <p className="text-sm text-slate-500 mt-3">Start from the governance problem. The platform will surface playbooks, solution profiles, requests, people, districts, and Action Labs.</p>
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

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white p-5 rounded-lg border border-slate-200 flex flex-col">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{s.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1 mb-3">{s.count}</p>
            <Link href={s.href} className="text-xs text-emerald-600 hover:underline mt-auto">{s.cta} →</Link>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-3">Start from a problem</h2>
          <p className="text-sm text-slate-500 mb-4">Frame a field problem, find nearby evidence, or create a pathway for government adoption.</p>
          <div className="space-y-2">
            <Link href="/requests/submit" className="block text-sm text-slate-600 hover:text-emerald-700 hover:underline">Post a problem request</Link>
            <Link href="/solution-studio" className="block text-sm text-slate-600 hover:text-emerald-700 hover:underline">Open Solution Studio</Link>
            <Link href="/districts" className="block text-sm text-slate-600 hover:text-emerald-700 hover:underline">Review a District Canvas</Link>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-3">Contribute evidence</h2>
          <div className="space-y-2">
            <Link href="/playbooks/submit" className="block text-sm text-slate-600 hover:text-emerald-700 hover:underline">Submit a Playbook</Link>
            <Link href="/solutions/submit" className="block text-sm text-slate-600 hover:text-emerald-700 hover:underline">Submit a Solution Profile</Link>
            <Link href="/learning/submit" className="block text-sm text-slate-600 hover:text-emerald-700 hover:underline">Share a GovCap Resource</Link>
            <Link href="/action-labs" className="block text-sm text-slate-600 hover:text-emerald-700 hover:underline">Add Action Lab learning</Link>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-3">Needs attention</h2>
          <div className="space-y-2">
            <Link href="/my-submissions" className="block text-sm text-slate-600 hover:text-emerald-700 hover:underline">Track your submitted objects</Link>
            <Link href="/profile" className="block text-sm text-slate-600 hover:text-emerald-700 hover:underline">Update availability and expertise</Link>
            {isCurator && (
              <Link href="/curation" className="block text-sm text-slate-600 hover:text-emerald-700 hover:underline">
                Review curation queue {queueCount > 0 && <span className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full">{queueCount}</span>}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
