import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { demoActionLabs, demoDistricts, demoLearningResources, demoPlaybooks, demoProfiles, demoRequests, demoSolutions } from '@/lib/data/demo'

type DiscoverItem = {
  id: string
  type: string
  title: string
  summary: string
  href: string
  sector?: string | null
  geography?: string | null
  evidence?: string | null
  readiness?: string | null
  tags?: string[] | null
}

function includes(item: DiscoverItem, term: string) {
  if (!term) return true
  const haystack = [item.type, item.title, item.summary, item.sector, item.geography, item.evidence, item.readiness, ...(item.tags ?? [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(term.toLowerCase())
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const q = params.q ?? ''
  const selectedType = params.type ?? 'all'
  const sector = params.sector ?? ''
  const geography = params.geography ?? ''
  const evidence = params.evidence ?? ''
  const readiness = params.readiness ?? ''
  const supabase = await createClient()

  const [playbooksRes, solutionsRes, requestsRes, peopleRes, districtsRes, labsRes, learningRes] = await Promise.all([
    supabase.from('playbooks').select('id,title,summary,problem_statement,sector,state,district,tags,evidence_label,replication_readiness').eq('status', 'published').limit(25),
    supabase.from('solutions').select('id,name,description,problem_addressed,sector,tags,evidence_level,geographies_of_validation').eq('status', 'published').limit(25),
    supabase.from('requests').select('id,title,description,problem_context,sector,state,district,tags,status').eq('status', 'open').limit(25),
    supabase.from('profiles').select('id,full_name,bio,organisation,role,sectors,geographies,expertise,availability').eq('is_approved', true).limit(25),
    supabase.from('districts').select('id,state,district_name,summary,priority_themes').limit(25),
    supabase.from('action_labs').select('id,title,problem_statement,state_priority_theme,stage,status,districts(district_name,state)').limit(25),
    supabase.from('learning_resources').select('id,title,summary,resource_type,audience,tags').eq('status', 'published').limit(25),
  ])

  const items: DiscoverItem[] = [
    ...((playbooksRes.data?.length ? playbooksRes.data : demoPlaybooks) as any[]).map((p) => ({
      id: p.id,
      type: 'Playbook',
      title: p.title,
      summary: p.summary ?? p.problem_statement ?? '',
      href: `/playbooks/${p.id}`,
      sector: p.sector,
      geography: [p.district, p.state].filter(Boolean).join(', '),
      evidence: p.evidence_label,
      readiness: p.replication_readiness,
      tags: p.tags,
    })),
    ...((solutionsRes.data?.length ? solutionsRes.data : demoSolutions) as any[]).map((s) => ({
      id: s.id,
      type: 'Solution',
      title: s.name,
      summary: s.description ?? s.problem_addressed ?? '',
      href: `/solutions/${s.id}`,
      sector: s.sector,
      geography: s.geographies_of_validation?.join(', '),
      evidence: s.evidence_level,
      tags: s.tags,
    })),
    ...((requestsRes.data?.length ? requestsRes.data : demoRequests) as any[]).map((r) => ({
      id: r.id,
      type: 'Request',
      title: r.title,
      summary: r.description ?? r.problem_context ?? '',
      href: `/requests/${r.id}`,
      sector: r.sector,
      geography: [r.district, r.state].filter(Boolean).join(', '),
      tags: r.tags,
    })),
    ...((peopleRes.data?.length ? peopleRes.data : demoProfiles) as any[]).map((p) => ({
      id: p.id,
      type: 'Person',
      title: p.full_name ?? 'Unnamed profile',
      summary: [p.organisation, p.bio].filter(Boolean).join(' · '),
      href: `/people/${p.id}`,
      sector: p.sectors?.[0],
      geography: p.geographies?.join(', '),
      evidence: p.role?.replaceAll('_', ' '),
      tags: p.expertise,
    })),
    ...((districtsRes.data?.length ? districtsRes.data : demoDistricts) as any[]).map((d) => ({
      id: d.id,
      type: 'District',
      title: `${d.district_name}, ${d.state}`,
      summary: d.summary ?? '',
      href: `/districts/${d.id}`,
      geography: `${d.district_name}, ${d.state}`,
      tags: d.priority_themes,
    })),
    ...((labsRes.data?.length ? labsRes.data : demoActionLabs) as any[]).map((l) => ({
      id: l.id,
      type: 'Action Lab',
      title: l.title,
      summary: l.problem_statement ?? '',
      href: `/action-labs/${l.id}`,
      sector: l.state_priority_theme,
      geography: l.districts ? `${l.districts.district_name}, ${l.districts.state}` : undefined,
      evidence: l.stage,
      tags: l.secondary_indicators,
    })),
    ...((learningRes.data?.length ? learningRes.data : demoLearningResources) as any[]).map((r) => ({
      id: r.id,
      type: 'Learning',
      title: r.title,
      summary: r.summary ?? '',
      href: `/learning/${r.id}`,
      evidence: r.audience ?? r.resource_type,
      tags: r.tags,
    })),
  ]

  const filtered = items.filter((item) =>
    includes(item, q)
    && (selectedType === 'all' || item.type.toLowerCase().replace(' ', '-') === selectedType)
    && (!sector || includes(item, sector))
    && (!geography || includes(item, geography))
    && (!evidence || item.evidence === evidence)
    && (!readiness || item.readiness === readiness)
  )

  const similarSignal = q && filtered.some((item) => ['Playbook', 'Solution', 'Request'].includes(item.type))

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Discover</h1>
        <p className="text-slate-500 mt-1">Search across curated knowledge, districts, Action Labs, people, requests, and learning resources.</p>
      </div>

      <form className="bg-white border border-slate-200 rounded-lg p-4 mb-5 grid gap-3 lg:grid-cols-[1fr_160px_150px_150px_150px_120px]">
        <input name="q" defaultValue={q} className="input" placeholder="Search problems, districts, solutions..." />
        <select name="type" defaultValue={selectedType} className="input">
          <option value="all">All types</option>
          <option value="playbook">Playbooks</option>
          <option value="solution">Solutions</option>
          <option value="request">Requests</option>
          <option value="person">People</option>
          <option value="district">Districts</option>
          <option value="action-lab">Action Labs</option>
          <option value="learning">Learning</option>
        </select>
        <input name="sector" defaultValue={sector} className="input" placeholder="Sector" />
        <input name="geography" defaultValue={geography} className="input" placeholder="Geography" />
        <select name="readiness" defaultValue={readiness} className="input">
          <option value="">Readiness</option>
          <option value="red">Red</option>
          <option value="amber">Amber</option>
          <option value="green">Green</option>
        </select>
        <button className="btn-primary" type="submit">Apply</button>
      </form>

      {similarSignal ? (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-4 mb-5">
          Someone has worked on a similar problem. Start with the matching playbooks, requests, and solution profiles below.
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
          <p className="font-semibold text-slate-900">No trusted object matches this search yet.</p>
          <p className="text-sm text-slate-500 mt-2 mb-4">Post a request so curators and mentors can help route the problem.</p>
          <Link href="/requests/submit" className="btn-primary">Post a request</Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((item) => (
            <Link key={`${item.type}-${item.id}`} href={item.href} className="bg-white border border-slate-200 rounded-lg p-5 hover:border-brand-300 transition-colors">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs uppercase tracking-wide text-brand-700 font-semibold">{item.type}</span>
                {item.sector ? <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{item.sector}</span> : null}
                {item.geography ? <span className="text-xs text-slate-500">{item.geography}</span> : null}
                {item.evidence ? <span className="text-xs text-slate-500 capitalize">{item.evidence.replaceAll('_', ' ')}</span> : null}
              </div>
              <h2 className="font-semibold text-slate-900">{item.title}</h2>
              <p className="text-sm text-slate-600 mt-1 line-clamp-2">{item.summary}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
