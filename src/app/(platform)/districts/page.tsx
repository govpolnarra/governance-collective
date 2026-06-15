import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { demoActionLabs, demoDistricts } from '@/lib/data/demo'

export default async function DistrictsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('districts')
    .select('*')
    .order('state')
    .order('district_name')

  const districts = (data?.length ? data : demoDistricts) as any[]

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">District Canvas</h1>
          <p className="text-slate-500 mt-1">Continuity views for live district priorities, Action Labs, decisions, and handover notes.</p>
        </div>
        <Link href="/discover?type=district" className="btn-secondary">Search districts</Link>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {districts.map((district) => {
          const activeLabs = demoActionLabs.filter((lab) => lab.district_id === district.id).length
          return (
            <Link key={district.id} href={`/districts/${district.id}`} className="bg-white border border-slate-200 rounded-lg p-5 hover:border-brand-300 transition-colors">
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="text-xs uppercase tracking-wide text-brand-700 font-semibold">{district.state}</p>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{district.canvas_visibility}</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">{district.district_name}</h2>
              <p className="text-sm text-slate-600 mt-2 line-clamp-3">{district.summary}</p>
              <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                <div>
                  <p className="text-slate-400">Active problems</p>
                  <p className="font-semibold text-slate-900">{district.active_problem_count ?? 0}</p>
                </div>
                <div>
                  <p className="text-slate-400">Active labs</p>
                  <p className="font-semibold text-slate-900">{activeLabs}</p>
                </div>
              </div>
              {district.priority_themes?.length ? (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {district.priority_themes.map((theme: string) => <span key={theme} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">{theme}</span>)}
                </div>
              ) : null}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
