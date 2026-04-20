import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const RESOURCE_TYPE_LABELS: Record<string, string> = {
  article: '📝 Article',
  video: '🎥 Video',
  report: '📊 Report',
  course: '🎓 Course',
  podcast: '🎧 Podcast',
  tool: '🛠️ Tool',
}

export default async function LearningDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: resource } = await supabase
    .from('learning_resources')
    .select('*, profiles(full_name, organisation, avatar_url)')
    .eq('id', params.id)
    .single()

  if (!resource) notFound()

  const profile = (resource as any).profiles

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Link href="/learning" className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-block">
        &larr; Back to Learning
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {resource.resource_type && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">
                {RESOURCE_TYPE_LABELS[resource.resource_type] || resource.resource_type}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{resource.title}</h1>
          {profile && (
            <p className="text-sm text-slate-500 mt-1">
              Submitted by {profile.full_name}{profile.organisation ? ` · ${profile.organisation}` : ''}
            </p>
          )}
        </div>

        {resource.summary && (
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Summary</h2>
            <p className="text-slate-700 whitespace-pre-wrap">{resource.summary}</p>
          </div>
        )}

        {resource.resource_url && (
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Resource Link</h2>
            <a
              href={resource.resource_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline break-all"
            >
              {resource.resource_url}
            </a>
          </div>
        )}

        {resource.tags && resource.tags.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {resource.tags.map((tag: string) => (
                <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-slate-400 border-t border-slate-100 pt-4">
          Added {new Date(resource.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}
