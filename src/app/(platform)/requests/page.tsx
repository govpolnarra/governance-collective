import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SearchFilter from '@/components/SearchFilter'

const STATUS_BADGE: Record<string, string> = {
  open: 'bg-emerald-100 text-emerald-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-slate-100 text-slate-500',
  closed: 'bg-slate-100 text-slate-400',
}

export default async function RequestsPage() {
  const supabase = await createClient()
  const { data: requests } = await supabase
    .from('requests')
    .select('*, profiles(full_name, organisation)')
    .in('status', ['open', 'in_progress'])
    .order('created_at', { ascending: false })

  const items = (requests ?? []).map((r: any) => ({
    id: r.id,
    title: r.title,
    sector: r.sector,
    tags: r.tags,
    description: r.description,
    status: r.status,
    author: r.profiles?.full_name ?? 'Unknown',
    organisation: r.profiles?.organisation ?? '',
  }))

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Requests</h1>
          <p className="text-slate-500 mt-1">Help needed from the community. Respond with a solution or playbook.</p>
        </div>
        <Link href="/requests/submit" className="btn-primary">+ Post a Request</Link>
      </div>

      {items.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-400 text-lg mb-2">No open requests right now.</p>
          <Link href="/requests/submit" className="btn-primary mt-4 inline-block">Post a Request</Link>
        </div>
      ) : (
        <SearchFilter
          items={items}
          placeholder="Search requests by title or sector..."
          renderItem={(item: any) => (
            <Link key={item.id} href={`/requests/${item.id}`} className="card p-5 hover:shadow-md transition-shadow block">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${STATUS_BADGE[item.status] ?? 'bg-slate-100 text-slate-500'}`}>
                  {item.status?.replace('_', ' ')}
                </span>
                {item.sector && <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded">{item.sector}</span>}
              </div>
              <h2 className="text-base font-semibold text-slate-800 mb-1">{item.title}</h2>
              {item.description && <p className="text-sm text-slate-500 line-clamp-2 mb-2">{item.description}</p>}
              <p className="text-xs text-slate-400">By {item.author}{item.organisation ? ` · ${item.organisation}` : ''}</p>
            </Link>
          )}
        />
      )}
    </div>
  )
}
