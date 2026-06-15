import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { demoActionLabs } from '@/lib/data/demo'

export default async function ActionLabsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('action_labs')
    .select('*, districts(district_name,state)')
    .order('updated_at', { ascending: false })

  const labs = (data?.length ? data : demoActionLabs) as any[]

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Action Labs</h1>
        <p className="text-slate-500 mt-1">Structured workspaces for live field diagnosis, learning logs, review notes, and emerging evidence.</p>
      </div>

      <div className="grid gap-4">
        {labs.map((lab) => (
          <Link key={lab.id} href={`/action-labs/${lab.id}`} className="bg-white border border-slate-200 rounded-lg p-5 hover:border-brand-300 transition-colors">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full capitalize">{lab.stage}</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">{lab.status}</span>
              {lab.districts ? <span className="text-xs text-slate-500">{lab.districts.district_name}, {lab.districts.state}</span> : null}
            </div>
            <h2 className="font-semibold text-slate-900">{lab.title}</h2>
            <p className="text-sm text-slate-600 mt-1">{lab.problem_statement}</p>
            <p className="text-sm text-slate-500 mt-3"><span className="font-medium">Primary indicator:</span> {lab.primary_indicator}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
