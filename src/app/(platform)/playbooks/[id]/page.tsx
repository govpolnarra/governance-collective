import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import BookmarkButton from '@/components/BookmarkButton'

export default async function PlaybookDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: playbook } = await supabase
    .from('playbooks')
    .select('*, profiles(full_name, organisation, avatar_url)')
    .eq('id', params.id)
    .single()

  if (!playbook) notFound()

  const profile = (playbook as any).profiles

  // Check if current user has bookmarked this
  let isBookmarked = false
  if (user) {
    const { data: bookmark } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('content_id', params.id)
      .eq('content_type', 'playbook')
      .maybeSingle()
    isBookmarked = !!bookmark
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Link href="/playbooks" className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-block">
        &larr; Back to Playbooks
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-6">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium uppercase">
                {playbook.status}
              </span>
              {playbook.sector && (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  {playbook.sector}
                </span>
              )}
            </div>
            {user && (
              <BookmarkButton
                contentId={params.id}
                contentType="playbook"
                initialBookmarked={isBookmarked}
              />
            )}
          </div>

          <h1 className="text-2xl font-bold text-slate-900">{playbook.title}</h1>

          {profile && (
            <p className="text-sm text-slate-500 mt-1">
              by {profile.full_name}{profile.organisation ? ` · ${profile.organisation}` : ''}
            </p>
          )}
        </div>

        {playbook.summary && (
          <div>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">Summary</h2>
            <p className="text-slate-600 leading-relaxed">{playbook.summary}</p>
          </div>
        )}

        {playbook.problem_statement && (
          <div>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">Problem Statement</h2>
            <p className="text-slate-600 leading-relaxed">{playbook.problem_statement}</p>
          </div>
        )}

        {playbook.approach && (
          <div>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">Approach</h2>
            <p className="text-slate-600 leading-relaxed">{playbook.approach}</p>
          </div>
        )}

        {playbook.outcomes && (
          <div>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">Outcomes</h2>
            <p className="text-slate-600 leading-relaxed">{playbook.outcomes}</p>
          </div>
        )}

        {playbook.tags && playbook.tags.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {playbook.tags.map((tag: string) => (
                <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{tag}</span>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-slate-400">
          Published {new Date(playbook.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
