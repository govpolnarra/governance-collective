import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { demoProfiles } from '@/lib/data/demo'
import { roleLabel } from '@/lib/access'

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const q = (params.q ?? '').toLowerCase()
  const role = params.role ?? ''
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id,full_name,bio,organisation,role,sectors,geographies,methods,expertise,availability,recognition_level,is_approved')
    .eq('is_approved', true)
    .order('full_name')

  const people = ((data?.length ? data : demoProfiles) as any[]).filter((person) => {
    const text = [person.full_name, person.bio, person.organisation, person.role, ...(person.sectors ?? []), ...(person.geographies ?? []), ...(person.expertise ?? [])].join(' ').toLowerCase()
    return (!q || text.includes(q)) && (!role || person.role === role)
  })

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">People Directory</h1>
        <p className="text-slate-500 mt-1">Practitioners, mentors, contributors, and solution providers with visible contribution signals.</p>
      </div>

      <form className="bg-white border border-slate-200 rounded-lg p-4 mb-5 grid gap-3 md:grid-cols-[1fr_220px_120px]">
        <input name="q" defaultValue={params.q} className="input" placeholder="Search expertise, sector, geography, organisation..." />
        <select name="role" defaultValue={role} className="input">
          <option value="">All roles</option>
          <option value="contributor">Contributor</option>
          <option value="seeker">Seeker</option>
          <option value="solution_provider">Solution provider</option>
          <option value="mentor">Mentor</option>
          <option value="partner">Partner</option>
          <option value="curator">Curator</option>
        </select>
        <button className="btn-primary" type="submit">Filter</button>
      </form>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {people.map((person) => (
          <Link key={person.id} href={`/people/${person.id}`} className="bg-white border border-slate-200 rounded-lg p-5 hover:border-brand-300 transition-colors">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-semibold shrink-0">{person.full_name?.charAt(0) ?? 'P'}</div>
              <div>
                <h2 className="font-semibold text-slate-900">{person.full_name ?? 'Unnamed profile'}</h2>
                <p className="text-sm text-slate-500">{person.organisation}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full capitalize">{roleLabel(person.role)}</span>
              {person.availability ? <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{person.availability.replaceAll('_', ' ')}</span> : null}
            </div>
            <p className="text-sm text-slate-600 mt-3 line-clamp-3">{person.bio}</p>
            {person.expertise?.length ? (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {person.expertise.slice(0, 3).map((tag: string) => <span key={tag} className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{tag}</span>)}
              </div>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  )
}
