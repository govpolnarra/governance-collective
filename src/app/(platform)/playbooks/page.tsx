import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SearchFilter from '@/components/SearchFilter'

export default async function PlaybooksPage() {
  const supabase = await createClient()
  const { data: playbooks } = await supabase
    .from('playbooks')
    .select('*, profiles(full_name, organisation)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  const items = (playbooks ?? []).map((p: any) => ({
    id: p.id,
    title: p.title,
    sector: p.sector,
    tags: p.tags,
    summary: p.summary,
    state: p.state,
    author: p.profiles?.full_name ?? 'Unknown',
    organisation: p.profiles?.organisation ?? '',
  }))

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Playbooks</h1>
          <p className="text-slate-500 mt-1">Field-tested methods and frameworks from government practitioners.</p>
        </div>
        <Link href="/playbooks/submit" className="btn-primary">+ Submit a Playbook</Link>
      </div>

      {items.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-400 text-lg mb-2">No playbooks published yet.</p>
          <p className="text-slate-400 text-sm mb-4">Be the first to contribute field knowledge.</p>
          <Link href="/playbooks/submit" className="btn-primary mt-4 inline-block">Submit a Playbook</Link>
        </div>
      ) : (
        <SearchFilter
          items={items}
          placeholder="Search playbooks by title, sector, or tag..."
          renderItem={(item: any) => (
            <Link key={item.id} href={`/playbooks/${item.id}`} className="card p-5 hover:shadow-md transition-shadow block">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {item.sector && <span className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">{item.sector}</span>}
                  {item.state && <span className="text-xs text-slate-400">{item.state}</span>}
                </div>
              </div>
              <h2 className="text-base font-semibold text-slate-800 mb-1">{item.title}</h2>
              {item.summary && <p className="text-sm text-slate-500 line-clamp-2 mb-2">{item.summary}</p>}
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
