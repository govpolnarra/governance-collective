import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import BookmarkButton from '@/components/BookmarkButton'

export default async function SolutionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const { data: solution } = await supabase
    .from('solutions')
    .select('*, profiles(full_name, organisation, avatar_url)')
    .eq('id', params.id)
    .single()

  if (!solution) notFound()

  const profile = (solution as any).profiles

  // Check if current user has bookmarked this
  const { data: { user } } = await supabase.auth.getUser()
  let isBookmarked = false
  if (user) {
    const { data: bookmark } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('content_type', 'solution')
      .eq('content_id', params.id)
      .maybeSingle()
    isBookmarked = !!bookmark
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Link href="/solutions" className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-block">
        &larr; Back to Solutions
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-6">
        <div>
          {solution.sector && (
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-medium mb-2 inline-block">
              {solution.sector}
            </span>
          )}
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-slate-900">{solution.name}</h1>
            {user && (
              <BookmarkButton
                contentType="solution"
                contentId={params.id}
                initialBookmarked={isBookmarked}
              />
            )}
          </div>
          {profile && (
            <p className="text-sm text-slate-500 mt-1">
              by {profile.full_name}{profile.organisation ? ` · ${profile.organisation}` : ''}
            </p>
          )}
        </div>

        {solution.description && (
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Description</h2>
            <p className="text-slate-600 leading-relaxed">{solution.description}</p>
          </div>
        )}

        {solution.problem_addressed && (
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Problem Addressed</h2>
            <p className="text-slate-600 leading-relaxed">{solution.problem_addressed}</p>
          </div>
        )}

        {solution.implementation_details && (
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Implementation Details</h2>
            <p className="text-slate-600 leading-relaxed">{solution.implementation_details}</p>
          </div>
        )}

        {solution.outcomes && (
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Outcomes</h2>
            <p className="text-slate-600 leading-relaxed">{solution.outcomes}</p>
          </div>
        )}

        {solution.tags && solution.tags.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {solution.tags.map((tag: string) => (
                <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{tag}</span>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-slate-400">Published {new Date(solution.created_at).toLocaleDateString()}</p>
      </div>
    </div>
  )
}
