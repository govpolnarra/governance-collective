import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

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
          <h1 className="text-2xl font-bold text-slate-900">{solution.name}</h1>
          {profile && (
            <p className="text-sm text-slate-500 mt-1">
              by {profile.full_name}{profile.organisation ? ` · ${profile.organisation}` : ''}
            </p>
          )}
        </div>

        {solution.description && (
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Description</h2>
            <p className="text-slate-700 whitespace-pre-wrap">{solution.description}</p>
          </div>
        )}

        {solution.problem_addressed && (
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Problem Addressed</h2>
            <p className="text-slate-700 whitespace-pre-wrap">{solution.problem_addressed}</p>
          </div>
        )}

        {solution.implementation_details && (
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Implementation Details</h2>
            <p className="text-slate-700 whitespace-pre-wrap">{solution.implementation_details}</p>
          </div>
        )}

        {solution.outcomes && (
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Outcomes</h2>
            <p className="text-slate-700 whitespace-pre-wrap">{solution.outcomes}</p>
          </div>
        )}

        {solution.tags && solution.tags.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {solution.tags.map((tag: string) => (
                <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-slate-400 border-t border-slate-100 pt-4">
          Published {new Date(solution.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}
