import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { demoActionLabs, demoLearningLogs, demoProfiles, demoSolutionPathways } from '@/lib/data/demo'

const stages = ['diagnose', 'design', 'embed', 'measure', 'replicate']

export default async function ActionLabDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const [{ data: labData }, { data: logsData }] = await Promise.all([
    supabase.from('action_labs').select('*, districts(district_name,state)').eq('id', id).maybeSingle(),
    supabase.from('learning_logs').select('*').eq('action_lab_id', id).order('date', { ascending: false }),
  ])

  const lab = labData ?? demoActionLabs.find((item) => item.id === id)
  if (!lab) notFound()
  const logs = (logsData?.length ? logsData : demoLearningLogs.filter((log) => log.action_lab_id === id)) as any[]
  const pathway = demoSolutionPathways.find((item) => item.action_lab_id === id)

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Link href="/action-labs" className="text-sm text-brand-700 hover:underline">Back to Action Labs</Link>
      <div className="mt-4 mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full capitalize">{lab.stage}</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full capitalize">{lab.status}</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{lab.visibility}</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">{lab.title}</h1>
        <p className="text-slate-600 mt-2 max-w-3xl">{lab.problem_statement}</p>
      </div>

      <div className="grid lg:grid-cols-[1.35fr_0.9fr] gap-5">
        <section className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Stage tracker</h2>
            <div className="grid grid-cols-5 gap-2">
              {stages.map((stage) => (
                <div key={stage} className={`text-center text-xs rounded-lg px-2 py-3 capitalize ${stage === lab.stage ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{stage}</div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="font-semibold text-slate-900 mb-3">Diagnosis and indicators</h2>
            <p className="text-sm text-slate-600 mb-4">{lab.root_cause_summary}</p>
            <p className="text-sm"><span className="font-medium text-slate-900">Primary indicator:</span> {lab.primary_indicator}</p>
            {lab.secondary_indicators?.length ? (
              <div className="flex flex-wrap gap-2 mt-3">
                {lab.secondary_indicators.map((indicator: string) => <span key={indicator} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{indicator}</span>)}
              </div>
            ) : null}
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <h2 className="font-semibold text-slate-900">Learning log feed</h2>
              <button className="btn-secondary" type="button">Add capture</button>
            </div>
            {logs.length ? (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">{log.log_type.replaceAll('_', ' ')}</span>
                      <span className="text-xs text-slate-500">{log.date}</span>
                      <span className="text-xs text-slate-500">{log.location}</span>
                    </div>
                    <p className="text-sm text-slate-600"><span className="font-medium text-slate-900">Learned:</span> {log.what_was_learned}</p>
                    <p className="text-sm text-slate-600 mt-2"><span className="font-medium text-slate-900">Changes next:</span> {log.what_changes_next}</p>
                    {log.support_needed ? <p className="text-sm text-amber-700 mt-2">Support needed: {log.support_needed}</p> : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No logs captured yet.</p>
            )}
          </div>
        </section>

        <aside className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="font-semibold text-slate-900 mb-3">Team and review</h2>
            <Info label="Government counterpart" value={lab.government_counterpart} />
            <Info label="Solution anchor" value={demoProfiles.find((p) => p.id === lab.solution_anchor_id)?.full_name ?? 'To be assigned'} />
            <Info label="Start date" value={lab.start_date} />
            <Info label="Next review" value={lab.next_review_date} />
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="font-semibold text-slate-900 mb-3">Convert learning into</h2>
            <div className="space-y-2 text-sm">
              <Link href="/playbooks/submit" className="block text-brand-700 hover:underline">Playbook draft</Link>
              <Link href="/requests/submit" className="block text-brand-700 hover:underline">Request for support</Link>
              <Link href="/learning/submit" className="block text-brand-700 hover:underline">GovCap resource</Link>
              {pathway ? <Link href={`/solution-studio/${pathway.id}`} className="block text-brand-700 hover:underline">Solution pathway brief</Link> : <Link href="/solution-studio" className="block text-brand-700 hover:underline">New solution pathway</Link>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="py-2 border-b border-slate-100 last:border-0">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value ?? 'Not set'}</p>
    </div>
  )
}
