import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SearchFilter from '@/components/SearchFilter'

export default async function SolutionsPage() {
  const supabase = await createClient()
  const { data: solutions } = await supabase
    .from('solutions')
    .select('*, profiles(full_name, organisation)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  const items = (solutions ?? []).map((s: any) => ({
    id: s.id,
    title: s.name,
    sector: s.sector,
    tags: s.tags,
    description: s.description,
    author: s.profiles?.full_name ?? 'Unknown',
    organisation: s.profiles?.organisation ?? '',
  }))

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Solutions</h1>
          <p className="text-slate-500 mt-1">Innovative approaches to governance challenges.</p>
        </div>
        <Link href="/solutions/submit" className="btn-primary">+ Submit a Solution</Link>
      </div>

      {items.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-400 text-lg mb-2">No solutions published yet.</p>
          <Link href="/solutions/submit" className="btn-primary mt-4 inline-block">Submit a Solution</Link>
        </div>
      ) : (
        <SearchFilter
          items={items}
          placeholder="Search solutions by title, sector, or tag..."
          renderItem={(item: any) => (
            <Link key={item.id} href={`/solutions/${item.id}`} className="card p-5 hover:shadow-md transition-shadow block">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {item.sector && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-medium">{item.sector}</span>}
              </div>
              <h2 className="text-base font-semibold text-slate-800 mb-1">{item.title}</h2>
              {item.description && <p className="text-sm text-slate-500 line-clamp-2 mb-2">{item.description}</p>}
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
