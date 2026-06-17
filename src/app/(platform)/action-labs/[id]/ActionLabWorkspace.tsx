'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

const logTypes = [
  ['daily_capture', 'Daily capture'],
  ['weekly_log', 'Weekly log'],
  ['monthly_synthesis', 'Monthly synthesis'],
  ['quarterly_review_note', 'Quarterly review note'],
]

export function ActionLabWorkspace({
  labId,
  currentStage,
  currentStatus,
  reviewOwnerId,
  people,
}: {
  labId: string
  currentStage: string
  currentStatus: string
  reviewOwnerId?: string | null
  people: { id: string; label: string }[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    const formData = new FormData(event.currentTarget)
    const payload = Object.fromEntries(formData.entries())
    const response = await fetch(`/api/action-labs/${labId}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const result = await response.json()
    setSaving(false)
    if (!response.ok) {
      setError(result.error || 'Could not save learning log')
      return
    }
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return <button className="btn-secondary" type="button" onClick={() => setOpen(true)}>Add capture</button>
  }

  return (
    <form onSubmit={submit} className="w-full sm:basis-full border border-brand-100 bg-brand-50/40 rounded-lg p-4 mb-4 space-y-3">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="label">Capture type</label>
          <select name="log_type" className="input w-full" defaultValue="weekly_log">
            {logTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Date</label>
          <input name="date" type="date" className="input w-full" defaultValue={new Date().toISOString().slice(0, 10)} />
        </div>
        <div>
          <label className="label">Location</label>
          <input name="location" className="input w-full" placeholder="Block, office, school..." />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <TextArea name="what_was_tried" label="What was tried" />
        <TextArea name="what_was_observed" label="What was observed" />
        <TextArea name="what_was_learned" label="What was learned" required />
        <TextArea name="what_changes_next" label="What changes next" />
        <TextArea name="blockers" label="Blockers" />
        <TextArea name="decision_notes" label="Decision notes" />
      </div>
      <TextArea name="support_needed" label="Support needed" />
      <TextArea name="review_notes" label="Review note" />
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="label">Stage</label>
          <select name="stage" className="input w-full" defaultValue={currentStage}>
            {['diagnose', 'design', 'embed', 'measure', 'replicate', 'closed'].map((stage) => <option key={stage} value={stage}>{stage}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Lab status</label>
          <select name="lab_status" className="input w-full" defaultValue={currentStatus}>
            {['active', 'blocked', 'paused', 'completed'].map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Next review</label>
          <input name="next_review_date" type="date" className="input w-full" />
        </div>
        <div>
          <label className="label">Review owner</label>
          <select name="review_owner_id" className="input w-full" defaultValue={reviewOwnerId || ''}>
            <option value="">Keep unassigned</option>
            {people.map((person) => <option key={person.id} value={person.id}>{person.label}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save capture'}</button>
        <button className="btn-secondary" type="button" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  )
}

function TextArea({ name, label, required = false }: { name: string; label: string; required?: boolean }) {
  return (
    <div>
      <label className="label">{label}{required ? <span className="text-red-500"> *</span> : null}</label>
      <textarea name={name} rows={3} required={required} className="textarea w-full" />
    </div>
  )
}

export function ConvertLearningLog({ logId, convertedToType, convertedToId }: { logId: string; convertedToType?: string | null; convertedToId?: string | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function convert(type: string) {
    setLoading(type)
    setError(null)
    const response = await fetch(`/api/learning-logs/${logId}/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    })
    const result = await response.json()
    setLoading(null)
    if (!response.ok) {
      setError(result.error || 'Could not convert learning log')
      return
    }
    router.push(result.href)
  }

  if (convertedToType && convertedToId) {
    return <p className="text-xs text-emerald-700 mt-3">Converted to {convertedToType.replaceAll('_', ' ')}.</p>
  }

  return (
    <div className="mt-3">
      {error ? <p className="text-xs text-red-600 mb-2">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button className="text-xs px-2 py-1 rounded border border-slate-200 hover:border-brand-300" type="button" onClick={() => convert('playbook')} disabled={!!loading}>{loading === 'playbook' ? 'Creating...' : 'Playbook'}</button>
        <button className="text-xs px-2 py-1 rounded border border-slate-200 hover:border-brand-300" type="button" onClick={() => convert('learning_resource')} disabled={!!loading}>{loading === 'learning_resource' ? 'Creating...' : 'Learning resource'}</button>
        <button className="text-xs px-2 py-1 rounded border border-slate-200 hover:border-brand-300" type="button" onClick={() => convert('request')} disabled={!!loading}>{loading === 'request' ? 'Creating...' : 'Support request'}</button>
        <button className="text-xs px-2 py-1 rounded border border-slate-200 hover:border-brand-300" type="button" onClick={() => convert('solution_pathway')} disabled={!!loading}>{loading === 'solution_pathway' ? 'Creating...' : 'Solution pathway'}</button>
      </div>
    </div>
  )
}
