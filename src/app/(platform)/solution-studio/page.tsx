import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { demoSolutionPathways } from '@/lib/data/demo'
import PathwayBuilder from './PathwayBuilder'

export default async function SolutionStudioPage() {
  const supabase = await createClient()
  const [{ data, error }, { data: districts }, { data: actionLabs }, { data: solutions }, { data: experts }] = await Promise.all([
    supabase
      .from('solution_pathways')
      .select('*, districts(district_name,state), action_labs(title)')
      .order('updated_at', { ascending: false }),
    supabase.from('districts').select('id,district_name,state').order('district_name'),
    supabase.from('action_labs').select('id,title').order('updated_at', { ascending: false }),
    supabase.from('solutions').select('id,name').eq('status', 'published').order('name'),
    supabase.from('profiles').select('id,full_name,organisation').eq('is_approved', true).order('full_name'),
  ])

  const pathways = (data?.length ? data : demoSolutionPathways) as any[]

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Solution Architecture Studio</h1>
          <p className="text-slate-500 mt-1">Build human-readable pathways from a specific governance problem to an implementable response.</p>
        </div>
        <PathwayBuilder
          mode="create"
          districts={(districts ?? []).map((district: any) => ({ id: district.id, label: `${district.district_name}, ${district.state}` }))}
          actionLabs={(actionLabs ?? []).map((lab: any) => ({ id: lab.id, label: lab.title }))}
          solutions={(solutions ?? []).map((solution: any) => ({ id: solution.id, label: solution.name ?? 'Untitled solution' }))}
          experts={(experts ?? []).map((expert: any) => ({
            id: expert.id,
            label: expert.organisation ? `${expert.full_name ?? 'Unnamed'} · ${expert.organisation}` : expert.full_name ?? 'Unnamed',
          }))}
        />
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg p-3 mb-4">
          Could not load live solution pathways, so demo records are shown. {error.message}
        </div>
      )}

      <div className="grid gap-4">
        {pathways.map((pathway) => (
          <Link key={pathway.id} href={`/solution-studio/${pathway.id}`} className="bg-white border border-slate-200 rounded-lg p-5 hover:border-brand-300">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full capitalize">{pathway.status}</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{pathway.visibility}</span>
              {pathway.districts ? <span className="text-xs text-slate-500">{pathway.districts.district_name}, {pathway.districts.state}</span> : null}
            </div>
            <h2 className="font-semibold text-slate-900">{pathway.title ?? 'Untitled pathway'}</h2>
            <p className="text-sm text-slate-600 mt-1">{pathway.architecture_summary ?? pathway.problem_statement ?? 'Draft pathway brief.'}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
