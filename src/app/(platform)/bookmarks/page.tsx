import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function BookmarksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('id, content_id, content_type, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Group by content type
  const playbookIds = bookmarks?.filter(b => b.content_type === 'playbook').map(b => b.content_id) ?? []
  const solutionIds = bookmarks?.filter(b => b.content_type === 'solution').map(b => b.content_id) ?? []
  const learningIds = bookmarks?.filter(b => b.content_type === 'learning_resource').map(b => b.content_id) ?? []
  const requestIds  = bookmarks?.filter(b => b.content_type === 'request').map(b => b.content_id) ?? []

  const [{ data: playbooks }, { data: solutions }, { data: learningResources }, { data: requests }] =
    await Promise.all([
      playbookIds.length
        ? supabase.from('playbooks').select('id, title, summary, status').in('id', playbookIds)
        : Promise.resolve({ data: [] }),
      solutionIds.length
        ? supabase.from('solutions').select('id, name, description, status').in('id', solutionIds)
        : Promise.resolve({ data: [] }),
      learningIds.length
        ? supabase.from('learning_resources').select('id, title, summary, status').in('id', learningIds)
        : Promise.resolve({ data: [] }),
      requestIds.length
        ? supabase.from('requests').select('id, title, description, status').in('id', requestIds)
        : Promise.resolve({ data: [] }),
    ])

  const total = (bookmarks ?? []).length

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Bookmarks</h1>
        <p className="text-sm text-gray-500 mt-1">{total} saved item{total !== 1 ? 's' : ''}</p>
      </div>

      {total === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500 text-sm">You haven&apos;t bookmarked anything yet.</p>
          <p className="text-gray-400 text-sm mt-1">Browse <Link href="/playbooks" className="text-green-600 hover:underline">Playbooks</Link>, <Link href="/solutions" className="text-green-600 hover:underline">Solutions</Link>, or <Link href="/learning" className="text-green-600 hover:underline">Learning Resources</Link> to save items here.</p>
        </div>
      )}

      {(playbooks ?? []).length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">📋 Playbooks</h2>
          <div className="space-y-3">
            {playbooks!.map(p => (
              <Link key={p.id} href={`/playbooks/${p.id}`} className="block rounded-lg border border-gray-200 p-4 hover:border-green-400 hover:shadow-sm transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{p.title}</p>
                    {p.summary && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.summary}</p>}
                  </div>
                  <span className="ml-4 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 shrink-0">{p.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {(solutions ?? []).length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">💡 Solutions</h2>
          <div className="space-y-3">
            {solutions!.map(s => (
              <Link key={s.id} href={`/solutions/${s.id}`} className="block rounded-lg border border-gray-200 p-4 hover:border-green-400 hover:shadow-sm transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{s.name}</p>
                    {s.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{s.description}</p>}
                  </div>
                  <span className="ml-4 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 shrink-0">{s.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {(learningResources ?? []).length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">📚 Learning Resources</h2>
          <div className="space-y-3">
            {learningResources!.map(r => (
              <Link key={r.id} href={`/learning/${r.id}`} className="block rounded-lg border border-gray-200 p-4 hover:border-green-400 hover:shadow-sm transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{r.title}</p>
                    {r.summary && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{r.summary}</p>}
                  </div>
                  <span className="ml-4 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 shrink-0">{r.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {(requests ?? []).length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">❓ Requests</h2>
          <div className="space-y-3">
            {requests!.map(r => (
              <Link key={r.id} href={`/requests/${r.id}`} className="block rounded-lg border border-gray-200 p-4 hover:border-green-400 hover:shadow-sm transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{r.title}</p>
                    {r.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{r.description}</p>}
                  </div>
                  <span className="ml-4 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 shrink-0">{r.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
