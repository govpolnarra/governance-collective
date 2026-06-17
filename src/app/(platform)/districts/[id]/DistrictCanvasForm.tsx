'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

const entryTypes = [
  ['active_problem', 'Active problem'],
  ['actor', 'Actor or institution'],
  ['handover_note', 'Handover note'],
  ['decision', 'Decision'],
  ['bottleneck', 'Bottleneck'],
  ['opportunity', 'Opportunity'],
  ['context_note', 'Context note'],
  ['priority', 'Priority'],
]

export default function DistrictCanvasForm({ districtId }: { districtId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries())
    const response = await fetch(`/api/districts/${districtId}/canvas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const result = await response.json()
    setSaving(false)
    if (!response.ok) {
      setError(result.error || 'Could not save District Canvas entry')
      return
    }
    setOpen(false)
    router.refresh()
  }

  if (!open) return <button className="btn-primary" type="button" onClick={() => setOpen(true)}>Add canvas entry</button>

  return (
    <form onSubmit={submit} className="bg-white border border-brand-100 rounded-lg p-4 mb-5 space-y-3">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="label">Entry type</label>
          <select name="entry_type" className="input w-full" defaultValue="active_problem">
            {entryTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" className="input w-full" defaultValue="active">
            {['active', 'watch', 'deferred', 'closed'].map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Visibility</label>
          <select name="visibility" className="input w-full" defaultValue="trusted">
            {['trusted', 'internal', 'registered', 'public'].map((visibility) => <option key={visibility} value={visibility}>{visibility}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Title</label>
        <input name="title" required className="input w-full" />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea name="description" rows={4} className="textarea w-full" />
      </div>
      <div className="flex gap-2">
        <button className="btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save entry'}</button>
        <button className="btn-secondary" type="button" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  )
}
