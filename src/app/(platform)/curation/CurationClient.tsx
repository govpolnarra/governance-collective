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
  created_at: string
  contentTitle: string
  contentHref: string
  profiles?: { full_name: string | null; organisation: string | null } | null
}

interface Props {
  queue: QueueItem[]
  userRole: string
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  playbook: '📋 Playbook',
  solution: '💡 Solution',
  learning_resource: '📚 Learning Resource',
  request: '❓ Request',
}

export default function CurationClient({ queue, userRole }: Props) {
  const supabase = createBrowserClient()
  const router = useRouter()
  const [processing, setProcessing] = useState<Record<string, 'approving' | 'rejecting' | null>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [done, setDone] = useState<Record<string, 'approved' | 'rejected'>>({})

  const handleAction = async (itemId: string, action: 'approve' | 'reject') => {
    setProcessing(p => ({ ...p, [itemId]: action === 'approve' ? 'approving' : 'rejecting' }))
    const fn = action === 'approve' ? 'approve_content' : 'reject_content'
    const { error } = await supabase.rpc(fn, { p_queue_id: itemId, p_notes: notes[itemId] || null })
    if (!error) {
      setDone(d => ({ ...d, [itemId]: action === 'approve' ? 'approved' : 'rejected' }))
    } else {
      alert('Error: ' + error.message)
    }
    setProcessing(p => ({ ...p, [itemId]: null }))
  }

  const pending = queue.filter(item => !done[item.id])

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Curation Queue</h1>
          <p className="text-slate-500 mt-1 text-sm">{pending.length} submission{pending.length !== 1 ? 's' : ''} pending review</p>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">✨</p>
          <p className="text-lg font-medium text-slate-700">All caught up!</p>
          <p className="text-slate-400 text-sm">No submissions pending review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((item) => (
            <div key={item.id} className="card p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                      {CONTENT_TYPE_LABELS[item.content_type] ?? item.content_type}
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

              <div>
                <label className="label">Review Notes (optional)</label>
                <textarea
                  rows={2}
                  className="textarea w-full text-sm"
                  placeholder="Add feedback for the contributor..."
                  value={notes[item.id] ?? ''}
                  onChange={e => setNotes(n => ({ ...n, [item.id]: e.target.value }))}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleAction(item.id, 'approve')}
                  disabled={!!processing[item.id]}
                  className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {processing[item.id] === 'approving' ? 'Approving...' : '✓ Approve & Publish'}
                </button>
                <button
                  onClick={() => handleAction(item.id, 'reject')}
                  disabled={!!processing[item.id]}
                  className="flex-1 py-2 px-4 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {processing[item.id] === 'rejecting' ? 'Rejecting...' : '✕ Reject'}
                </button>
              </div>
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
                  {result === 'approved' ? '✓ Approved' : '✕ Rejected'}
                </span>
                <span className="font-mono text-xs text-slate-400">{id}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
