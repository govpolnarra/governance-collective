import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import BookmarkButton from '@/components/BookmarkButton'

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-emerald-100 text-emerald-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-slate-100 text-slate-600',
  closed: 'bg-slate-100 text-slate-400',
}

export default async function RequestDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const [{ data: request }, { data: { user } }] = await Promise.all([
    supabase
      .from('requests')
      .select('*, profiles(full_name, organisation, avatar_url)')
      .eq('id', params.id)
      .single(),
    supabase.auth.getUser(),
  ])

  if (!request) notFound()

  const profile = (request as any).profiles

  // Check if current user has bookmarked this
  let isBookmarked = false
  if (user) {
    const { data: bookmark } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('content_type', 'request')
      .eq('content_id', params.id)
      .maybeSingle()
    isBookmarked = !!bookmark
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Link href="/requests" className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-block">
        &larr; Back to Requests
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${STATUS_COLORS[request.status] || 'bg-slate-100 text-slate-600'}`}>
              {request.status?.replace('_', ' ')}
            </span>
            {request.sector && (
              <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded font-medium">
                {request.sector}
              </span>
            )}
          </div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-slate-900">{request.title}</h1>
            {user && (
              <BookmarkButton
                contentType="request"
                contentId={params.id}
                initialBookmarked={isBookmarked}
              />
            )}
          </div>
          {profile && (
            <p className="text-sm text-slate-500 mt-1">
              Requested by {profile.full_name}{profile.organisation ? ` · ${profile.organisation}` : ''}
            </p>
          )}
        </div>

        {request.description && (
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Description</h2>
            <p className="text-slate-600 leading-relaxed">{request.description}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Posted {new Date(request.created_at).toLocaleDateString()}
          </p>
          {user?.id === request.author_id && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">
              Your request
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
