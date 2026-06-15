import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { demoPlaybooks, demoProfiles, demoRequests, demoSolutions } from '@/lib/data/demo'
import { roleLabel } from '@/lib/access'

export default async function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  const person = data ?? demoProfiles.find((p) => p.id === id)
  if (!person) notFound()

  const contributions = [
    ...demoPlaybooks.filter((item) => item.author_id === id).map((item) => ({ title: item.title, type: 'Playbook', href: `/playbooks/${item.id}` })),
    ...demoSolutions.filter((item) => item.author_id === id).map((item) => ({ title: item.name, type: 'Solution', href: `/solutions/${item.id}` })),
    ...demoRequests.filter((item) => item.author_id === id).map((item) => ({ title: item.title, type: 'Request', href: `/requests/${item.id}` })),
  ]

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Link href="/people" className="text-sm text-brand-700 hover:underline">Back to people</Link>
      <div className="bg-white border border-slate-200 rounded-lg p-6 mt-4">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="h-20 w-20 rounded-full bg-brand-600 text-white flex items-center justify-center text-2xl font-semibold shrink-0">{person.full_name?.charAt(0) ?? 'P'}</div>
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full capitalize">{roleLabel(person.role)}</span>
              {person.availability ? <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{person.availability.replaceAll('_', ' ')}</span> : null}
              {person.recognition_level ? <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">{person.recognition_level}</span> : null}
            </div>
            <h1 className="text-3xl font-bold text-slate-900">{person.full_name}</h1>
            <p className="text-slate-500 mt-1">{person.organisation} · {person.location}</p>
            <p className="text-slate-700 mt-4 max-w-3xl">{person.bio}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-[0.8fr_1.2fr] gap-5 mt-5">
        <aside className="bg-white border border-slate-200 rounded-lg p-5">
          <ProfileTags title="Expertise" values={person.expertise} />
          <ProfileTags title="Geographies" values={person.geographies} />
          <ProfileTags title="Sectors" values={person.sectors} />
          <ProfileTags title="Methods" values={person.methods} />
        </aside>

        <section className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="font-semibold text-slate-900 mb-3">Published contributions</h2>
          {contributions.length ? (
            <div className="space-y-3">
              {contributions.map((item) => (
                <Link key={`${item.type}-${item.title}`} href={item.href} className="block border border-slate-200 rounded-lg p-4 hover:border-brand-300">
                  <span className="text-xs uppercase tracking-wide text-brand-700 font-semibold">{item.type}</span>
                  <p className="font-medium text-slate-900 mt-1">{item.title}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No published contributions yet.</p>
          )}
        </section>
      </div>
    </div>
  )
}

function ProfileTags({ title, values }: { title: string; values?: string[] | null }) {
  return (
    <div className="mb-5 last:mb-0">
      <h2 className="text-sm font-semibold text-slate-900 mb-2">{title}</h2>
      {values?.length ? (
        <div className="flex flex-wrap gap-2">{values.map((value) => <span key={value} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{value}</span>)}</div>
      ) : (
        <p className="text-sm text-slate-400">Not listed.</p>
      )}
    </div>
  )
}
