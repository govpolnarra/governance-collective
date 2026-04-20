import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import BookmarkButton from '@/components/BookmarkButton'

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

  // Check if current user has bookmarked this
  const { data: { user } } = await supabase.auth.getUser()
  let isBookmarked = false
  if (user) {
    const { data: bookmark } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('content_type', 'learning_resource')
      .eq('content_id', params.id)
      .maybeSingle()
    isBookmarked = !!bookmark
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Link href="/learning" className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-block">
        &larr; Back to Learning
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-6">
        <div>
          {resource.resource_type && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium mb-2 inline-block">
              {RESOURCE_TYPE_LABELS[resource.resource_type] || resource.resource_type}
            </span>
          )}
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-slate-900">{resource.title}</h1>
            {user && (
              <BookmarkButton
                contentType="learning_resource"
                contentId={params.id}
                initialBookmarked={isBookmarked}
              />
            )}
          </div>
          {profile && (
            <p className="text-sm text-slate-500 mt-1">
              Submitted by {profile.full_name}{profile.organisation ? ` · ${profile.organisation}` : ''}
            </p>
          )}
        </div>

        {resource.summary && (
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Summary</h2>
            <p className="text-slate-600 leading-relaxed">{resource.summary}</p>
          </div>
        )}

        {resource.resource_url && (
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Resource Link</h2>
            <a
              href={resource.resource_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {resource.resource_url}
            </a>
          </div>
        )}

        {resource.tags && resource.tags.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {resource.tags.map((tag: string) => (
                <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{tag}</span>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-slate-400">Added {new Date(resource.created_at).toLocaleDateString()}</p>
      </div>
    </div>
  )
}
