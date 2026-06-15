import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SearchFilter from '@/components/SearchFilter'
import { demoLearningResources } from '@/lib/data/demo'

const TYPE_LABELS: Record<string, string> = {
  article: 'Article',
  video: 'Video',
  report: 'Report',
  course: 'Course',
  podcast: 'Podcast',
  tool: 'Tool',
  learning_capsule: 'Learning capsule',
  working_with_government_guide: 'Working with government',
  module: 'Module',
  clinic_recording: 'Clinic',
  template: 'Template',
}

const tabs = [
  { href: '/learning', label: 'All', activeWhen: '' },
  { href: '/learning?audience=inside_government', label: 'Inside Government', activeWhen: 'inside_government' },
  { href: '/learning?audience=outside_government', label: 'Outside Government', activeWhen: 'outside_government' },
  { href: '/learning?type=template', label: 'Templates', activeWhen: 'template' },
  { href: '/learning?type=clinic_recording', label: 'Clinics', activeWhen: 'clinic_recording' },
]

export default async function LearningPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const audience = params.audience ?? ''
  const type = params.type ?? ''
  const supabase = await createClient()
  const { data: resources } = await supabase
    .from('learning_resources')
    .select('*, profiles(full_name, organisation)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  const items = ((resources?.length ? resources : demoLearningResources) as any[])
    .filter((r) => (!audience || r.audience === audience || r.audience === 'both') && (!type || r.resource_type === type))
    .map((r: any) => ({
    id: r.id,
    title: r.title,
    sector: r.sector,
    tags: r.tags,
    summary: r.summary,
    resource_type: r.resource_type,
    resource_url: r.resource_url,
    audience: r.audience,
    duration_minutes: r.duration_minutes,
    derived_from_type: r.derived_from_type,
    author: r.profiles?.full_name ?? 'Unknown',
    organisation: r.profiles?.organisation ?? '',
  }))

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">GovCap Learning Hub</h1>
          <p className="text-slate-500 mt-1">Field-derived learning for people working inside and alongside government.</p>
        </div>
        <Link href="/learning/submit" className="btn-primary">Submit a Resource</Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {tabs.map((tab) => {
          const active = (!tab.activeWhen && !audience && !type) || tab.activeWhen === audience || tab.activeWhen === type
          return <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-sm border ${active ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{tab.label}</Link>
        })}
      </div>

      {items.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-400 text-lg mb-2">No resources published yet.</p>
          <Link href="/learning/submit" className="btn-primary mt-4 inline-block">Submit a Resource</Link>
        </div>
      ) : (
        <SearchFilter
          items={items}
          placeholder="Search resources by title, sector, or tag..."
          renderItem={(item: any) => (
            <Link key={item.id} href={`/learning/${item.id}`} className="card p-5 hover:shadow-md transition-shadow block">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {item.resource_type && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">{TYPE_LABELS[item.resource_type] ?? item.resource_type}</span>}
                {item.audience && <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">{item.audience.replaceAll('_', ' ')}</span>}
                {item.duration_minutes && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{item.duration_minutes} min</span>}
                {item.sector && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{item.sector}</span>}
              </div>
              <h2 className="text-base font-semibold text-slate-800 mb-1">{item.title}</h2>
              {item.summary && <p className="text-sm text-slate-500 line-clamp-2 mb-2">{item.summary}</p>}
              {item.derived_from_type && <p className="text-xs text-amber-700 mb-2">Derived from {item.derived_from_type.replaceAll('_', ' ')} evidence</p>}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.tags.map((t: string) => (
                    <span key={t} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-400">By {item.author}{item.organisation ? ` · ${item.organisation}` : ''}</p>
            </Link>
          )}
        />
      )}
    </div>
  )
}
