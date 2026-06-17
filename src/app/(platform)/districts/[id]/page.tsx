import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { demoActionLabs, demoCanvasEntries, demoDistricts, demoLearningLogs, demoPlaybooks, demoRequests, demoSolutions } from '@/lib/data/demo'
import DistrictCanvasForm from './DistrictCanvasForm'

export default async function DistrictDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const [{ data: districtData }, { data: entriesData }, { data: labsData }] = await Promise.all([
    supabase.from('districts').select('*').eq('id', id).maybeSingle(),
    supabase.from('district_canvas_entries').select('*').eq('district_id', id).order('updated_at', { ascending: false }),
    supabase.from('action_labs').select('*, districts(district_name,state)').eq('district_id', id).order('updated_at', { ascending: false }),
  ])

  const district = districtData ?? demoDistricts.find((d) => d.id === id)
  if (!district) notFound()

  const entries = (entriesData?.length ? entriesData : demoCanvasEntries.filter((entry) => entry.district_id === id)) as any[]
  const labs = (labsData?.length ? labsData : demoActionLabs.filter((lab) => lab.district_id === id)) as any[]
  const grouped = (type: string) => entries.filter((entry) => entry.entry_type === type)
  const districtName = district.district_name as string

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Link href="/districts" className="text-sm text-brand-700 hover:underline">Back to districts</Link>
      <div className="mt-4 mb-6">
        <p className="text-xs uppercase tracking-wide text-brand-700 font-semibold">{district.state}</p>
        <h1 className="text-3xl font-bold text-slate-900">{districtName} District Canvas</h1>
        <p className="text-slate-600 mt-2 max-w-3xl">{district.summary}</p>
      </div>
      <DistrictCanvasForm districtId={district.id} />

      <div className="grid lg:grid-cols-[1.4fr_0.9fr] gap-5">
        <section className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="font-semibold text-slate-900 mb-3">What is active now</h2>
            <div className="grid gap-3">
              {labs.map((lab) => (
                <Link key={lab.id} href={`/action-labs/${lab.id}`} className="border border-slate-200 rounded-lg p-4 hover:border-brand-300">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full capitalize">{lab.stage}</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">{lab.status}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900">{lab.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{lab.problem_statement}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <CanvasList title="Current bottlenecks" items={grouped('bottleneck')} />
            <CanvasList title="Recent decisions" items={grouped('decision')} />
            <CanvasList title="Active problems" items={grouped('active_problem')} />
            <CanvasList title="Actors and institutions" items={grouped('actor')} />
            <CanvasList title="Continuity notes" items={[...grouped('handover_note'), ...grouped('context_note')]} />
          </div>
        </section>

        <aside className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="font-semibold text-slate-900 mb-3">Priority themes</h2>
            <div className="flex flex-wrap gap-2">
              {district.priority_themes?.map((theme: string) => <span key={theme} className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">{theme}</span>)}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="font-semibold text-slate-900 mb-3">Linked source objects</h2>
            <LinkedThing href="/playbooks" label="Playbooks" count={demoPlaybooks.filter((p) => p.district === districtName).length} />
            <LinkedThing href="/solutions" label="Solutions" count={demoSolutions.length} />
            <LinkedThing href="/requests" label="Requests" count={demoRequests.filter((r) => r.district === districtName).length} />
            <LinkedThing href="/action-labs" label="Learning logs" count={demoLearningLogs.filter((log) => labs.some((lab) => lab.id === log.action_lab_id)).length} />
          </div>
        </aside>
      </div>
    </div>
  )
}

function CanvasList({ title, items }: { title: string; items: any[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h2 className="font-semibold text-slate-900 mb-3">{title}</h2>
      {items.length ? (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id}>
              <p className="font-medium text-sm text-slate-900">{item.title}</p>
              <p className="text-sm text-slate-500 mt-1">{item.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">No entries yet.</p>
      )}
    </div>
  )
}

function LinkedThing({ href, label, count }: { href: string; label: string; count: number }) {
  return (
    <Link href={href} className="flex items-center justify-between py-2 text-sm border-b border-slate-100 last:border-0">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-900">{count}</span>
    </Link>
  )
}
