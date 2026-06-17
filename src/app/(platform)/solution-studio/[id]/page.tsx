import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { demoPlaybooks, demoProfiles, demoSolutionPathways, demoSolutions } from '@/lib/data/demo'
import PathwayBuilder from '../PathwayBuilder'

export default async function SolutionPathwayDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const [{ data }, { data: districts }, { data: actionLabs }, { data: solutions }, { data: expertsData }] = await Promise.all([
    supabase
      .from('solution_pathways')
      .select('*, districts(district_name,state), action_labs(title)')
      .eq('id', id)
      .maybeSingle(),
    supabase.from('districts').select('id,district_name,state').order('district_name'),
    supabase.from('action_labs').select('id,title').order('updated_at', { ascending: false }),
    supabase.from('solutions').select('id,name').eq('status', 'published').order('name'),
    supabase.from('profiles').select('id,full_name,organisation').eq('is_approved', true).order('full_name'),
  ])

  const pathway = data ?? demoSolutionPathways.find((item) => item.id === id)
  if (!pathway) notFound()

  const linkedSolutions = demoSolutions.filter((solution) => pathway.solution_ids?.includes(solution.id))
  const experts = demoProfiles.filter((profile) => pathway.expert_ids?.includes(profile.id))

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Link href="/solution-studio" className="text-sm text-brand-700 hover:underline">Back to Solution Studio</Link>
      <div className="mt-4 mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full capitalize">{pathway.status}</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{pathway.visibility}</span>
          {pathway.districts ? <span className="text-xs text-slate-500">{pathway.districts.district_name}, {pathway.districts.state}</span> : null}
        </div>
        <h1 className="text-3xl font-bold text-slate-900">{pathway.title ?? 'Untitled pathway'}</h1>
        <p className="text-slate-600 mt-2 max-w-3xl">{pathway.architecture_summary ?? pathway.problem_statement ?? 'Draft pathway brief.'}</p>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_0.9fr] gap-5">
        <section className="space-y-5">
          <PathwayBuilder
            mode="edit"
            pathway={pathway}
            districts={(districts ?? []).map((district: any) => ({ id: district.id, label: `${district.district_name}, ${district.state}` }))}
            actionLabs={(actionLabs ?? []).map((lab: any) => ({ id: lab.id, label: lab.title }))}
            solutions={(solutions ?? []).map((solution: any) => ({ id: solution.id, label: solution.name ?? 'Untitled solution' }))}
            experts={(expertsData ?? []).map((expert: any) => ({
              id: expert.id,
              label: expert.organisation ? `${expert.full_name ?? 'Unnamed'} · ${expert.organisation}` : expert.full_name ?? 'Unnamed',
            }))}
          />
          <BriefBlock title="Problem statement" body={pathway.problem_statement} />
          <BriefBlock title="Root cause" body={pathway.root_cause} />
          <BriefBlock title="Actors involved" body={pathway.actors ?? pathway.actor_changes} />
          <BriefBlock title="Possible solutions" body={pathway.possible_solutions} />
          <BriefBlock title="Adoption conditions" body={pathway.adoption_conditions} />
          <BriefBlock title="Sequencing plan" body={pathway.sequence} />
          <BriefBlock title="Measurement plan" body={pathway.measurement_plan} />
          <BriefBlock title="Risks" body={pathway.risks} />
        </section>

        <aside className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="font-semibold text-slate-900 mb-3">Government levers</h2>
            <div className="space-y-2">
              {pathway.government_levers?.length ? pathway.government_levers.map((lever: string) => <p key={lever} className="text-sm bg-slate-50 border border-slate-100 rounded-lg p-3">{lever}</p>) : <p className="text-sm text-slate-400">No levers added yet.</p>}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="font-semibold text-slate-900 mb-3">Linked solutions</h2>
            {(linkedSolutions.length ? linkedSolutions : demoSolutions.slice(0, 1)).map((solution) => (
              <Link key={solution.id} href={`/solutions/${solution.id}`} className="block text-sm text-brand-700 hover:underline mb-2">{(solution as any).name ?? (solution as any).title ?? 'Untitled solution'}</Link>
            ))}
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="font-semibold text-slate-900 mb-3">Experts and mentors</h2>
            {(experts.length ? experts : demoProfiles.slice(0, 1)).map((expert) => (
              <Link key={expert.id} href={`/people/${expert.id}`} className="block text-sm text-brand-700 hover:underline mb-2">{expert.full_name}</Link>
            ))}
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="font-semibold text-slate-900 mb-3">Relevant playbooks</h2>
            {demoPlaybooks.slice(0, 2).map((playbook) => (
              <Link key={playbook.id} href={`/playbooks/${playbook.id}`} className="block text-sm text-brand-700 hover:underline mb-2">{playbook.title}</Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}

function BriefBlock({ title, body }: { title: string; body?: string | null }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h2 className="font-semibold text-slate-900 mb-2">{title}</h2>
      <p className="text-sm text-slate-600 whitespace-pre-line">{body ?? 'Not yet drafted.'}</p>
    </div>
  )
}
