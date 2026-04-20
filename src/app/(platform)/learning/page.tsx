import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { LearningResource } from '@/lib/types/database'

const RESOURCE_TYPES: Record<string, string> = {
  article: '📝 Article',
  video: '🎬 Video',
  report: '📊 Report',
  course: '🎓 Course',
  podcast: '🎧 Podcast',
  tool: '🛠️ Tool',
  other: '📎 Other',
}

export default async function LearningPage() {
  const supabase = await createClient()
  const { data: resources } = await supabase
    .from('learning_resources')
    .select('*, profiles(full_name)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Learning Resources</h1>
          <p className="text-slate-500 mt-1">Capsules on working with government – insights, mistakes, and lessons from the field.</p>
        </div>
        <Link href="/learning/submit" className="btn-primary">+ Share a Resource</Link>
      </div>

      {!resources || resources.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-400 text-lg mb-2">No learning resources yet.</p>
          <Link href="/learning/submit" className="btn-primary mt-4 inline-block">Share a Learning Resource</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(resources as LearningResource[]).map((r) => (
            <div key={r.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">
                  {r.resource_type ? (RESOURCE_TYPES[r.resource_type] ?? r.resource_type) : 'Resource'}
                </span>
              </div>
              <h2 className="font-semibold text-slate-900 mt-1 mb-2 line-clamp-2">{r.title}</h2>
              <p className="text-sm text-slate-500 line-clamp-3 mb-3">{r.summary}</p>
              {r.tags && r.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {r.tags.map((t: string) => (
                    <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between mt-auto">
                <p className="text-xs text-slate-400">By {(r as any).profiles?.full_name ?? 'Unknown'}</p>
                {r.resource_url && (
                  <a href={r.resource_url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline">
                    Open ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
