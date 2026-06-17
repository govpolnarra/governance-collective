'use client'
import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface QueueItem {
  id: string
  content_id: string
  content_type: string
  submitted_by: string
  status: string
  review_notes: string | null
  created_at: string
  contentTitle: string
  contentHref: string
  profiles?: { full_name: string | null; organisation: string | null } | null
}

interface CurationEvent {
  id: string
  queue_id: string | null
  content_id: string
  content_type: string
  action: string
  notes: string | null
  created_at: string
  profiles?: { full_name: string | null } | null
}

interface Props {
  queue: QueueItem[]
  events: CurationEvent[]
  userRole: string
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  playbook: '📋 Playbook',
  solution: '💡 Solution',
  learning_resource: '📚 Learning Resource',
  request: '❓ Request',
  solution_pathway: 'Solution Pathway',
}

export default function CurationClient({ queue, events, userRole }: Props) {
  const supabase = createBrowserClient()
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState('pending_review')
  const [typeFilter, setTypeFilter] = useState('')
  const [processing, setProcessing] = useState<Record<string, 'approving' | 'rejecting' | 'revision' | null>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [done, setDone] = useState<Record<string, 'approved' | 'rejected' | 'revision_requested'>>({})

  const handleAction = async (itemId: string, action: 'approve' | 'reject' | 'revision_requested') => {
    setProcessing(p => ({ ...p, [itemId]: action === 'approve' ? 'approving' : action === 'reject' ? 'rejecting' : 'revision' }))
    const fn = action === 'approve' ? 'approve_content' : action === 'reject' ? 'reject_content' : 'request_content_revision'
    const { error } = await supabase.rpc(fn, { p_queue_id: itemId, p_notes: notes[itemId] || null })
    if (!error) {
      setDone(d => ({ ...d, [itemId]: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'revision_requested' }))
      router.refresh()
    } else {
      alert('Error: ' + error.message)
    }
    setProcessing(p => ({ ...p, [itemId]: null }))
  }

  const visibleItems = queue
    .filter(item => !done[item.id])
    .filter(item => !statusFilter || item.status === statusFilter)
    .filter(item => !typeFilter || item.content_type === typeFilter)
  const pendingCount = queue.filter((item) => item.status === 'pending_review' && !done[item.id]).length

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Curation Queue</h1>
          <p className="text-slate-500 mt-1 text-sm">{pendingCount} submission{pendingCount !== 1 ? 's' : ''} pending review</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <select className="input sm:w-52" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All statuses</option>
            <option value="pending_review">Pending review</option>
            <option value="revision_requested">Revision requested</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
          </select>
          <select className="input sm:w-52" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value="">All content types</option>
            {Object.entries(CONTENT_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
      </div>

      {visibleItems.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">✨</p>
          <p className="text-lg font-medium text-slate-700">Nothing in this view.</p>
          <p className="text-slate-400 text-sm">Try a different status or content type.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleItems.map((item) => (
            <div key={item.id} className="card p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                      {CONTENT_TYPE_LABELS[item.content_type] ?? item.content_type}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${item.status === 'pending_review' ? 'bg-amber-50 text-amber-700' : item.status === 'published' ? 'bg-emerald-50 text-emerald-700' : item.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                      {item.status.replaceAll('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <Link
                    href={item.contentHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-semibold text-slate-900 hover:text-brand-600 transition-colors line-clamp-2"
                  >
                    {item.contentTitle} ↗️
                  </Link>
                  <p className="text-sm text-slate-500 mt-1">
                    Submitted by <span className="font-medium">{item.profiles?.full_name ?? 'Unknown'}</span>
                    {item.profiles?.organisation ? ` · ${item.profiles.organisation}` : ''}
                  </p>
                </div>
              </div>

              {item.review_notes ? (
                <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                  <span className="font-medium text-slate-800">Last review note:</span> {item.review_notes}
                </div>
              ) : null}

              {item.status === 'pending_review' || item.status === 'revision_requested' ? <div>
                <label className="label">Review Notes (optional)</label>
                <textarea
                  rows={2}
                  className="textarea w-full text-sm"
                  placeholder="Add feedback for the contributor..."
                  value={notes[item.id] ?? ''}
                  onChange={e => setNotes(n => ({ ...n, [item.id]: e.target.value }))}
                />
              </div> : null}

              {item.status === 'pending_review' || item.status === 'revision_requested' ? <div className="grid gap-3 md:grid-cols-3">
                <button
                  onClick={() => handleAction(item.id, 'approve')}
                  disabled={!!processing[item.id]}
                  className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {processing[item.id] === 'approving' ? 'Approving...' : '✓ Approve & Publish'}
                </button>
                <button
                  onClick={() => handleAction(item.id, 'revision_requested')}
                  disabled={!!processing[item.id]}
                  className="py-2 px-4 bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {processing[item.id] === 'revision' ? 'Sending...' : '↺ Request Revision'}
                </button>
                <button
                  onClick={() => handleAction(item.id, 'reject')}
                  disabled={!!processing[item.id]}
                  className="py-2 px-4 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {processing[item.id] === 'rejecting' ? 'Rejecting...' : '✕ Reject'}
                </button>
              </div> : null}
            </div>
          ))}
        </div>
      )}

      {Object.keys(done).length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Reviewed this session</h2>
          <div className="space-y-2">
            {Object.entries(done).map(([id, result]) => (
              <div key={id} className="flex items-center gap-3 text-sm text-slate-500 p-3 bg-slate-50 rounded-lg">
                <span className={result === 'approved' ? 'text-emerald-600' : 'text-red-500'}>
                  {result === 'approved' ? '✓ Approved' : result === 'rejected' ? '✕ Rejected' : '↺ Revision requested'}
                </span>
                <span className="font-mono text-xs text-slate-400">{id}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Review history</h2>
          <p className="text-sm text-slate-500">Latest curation actions across the queue.</p>
        </div>
        <div className="divide-y divide-slate-100">
          {events.map((event) => (
            <div key={event.id} className="px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-slate-900 capitalize">{event.action.replaceAll('_', ' ')}</span>
                <span className="text-slate-500">{CONTENT_TYPE_LABELS[event.content_type] ?? event.content_type}</span>
                <span className="text-slate-400">{new Date(event.created_at).toLocaleString('en-IN')}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                By {event.profiles?.full_name ?? 'Unknown'}{event.notes ? ` · ${event.notes}` : ''}
              </p>
            </div>
          ))}
          {events.length === 0 ? <div className="px-4 py-8 text-center text-slate-500 text-sm">No review events yet.</div> : null}
        </div>
      </div>
    </div>
  )
}
