import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

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
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                {request.sector}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{request.title}</h1>
          {profile && (
            <p className="text-sm text-slate-500 mt-1">
              Requested by {profile.full_name}{profile.organisation ? ` · ${profile.organisation}` : ''}
            </p>
          )}
        </div>

        {request.description && (
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Description</h2>
            <p className="text-slate-700 whitespace-pre-wrap">{request.description}</p>
          </div>
        )}

        <div className="text-xs text-slate-400 border-t border-slate-100 pt-4 flex items-center justify-between">
          <span>Posted {new Date(request.created_at).toLocaleDateString()}</span>
          {user?.id === request.author_id && (
            <span className="text-slate-500 font-medium">Your request</span>
          )}
        </div>
      </div>
    </div>
  )
}
