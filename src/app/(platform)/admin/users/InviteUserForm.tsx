'use client'

import { useState, type FormEvent } from 'react'

export default function InviteUserForm() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('contributor')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function sendInvite(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    const response = await fetch('/api/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role, note }),
    })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      setError(payload.error ?? 'Could not send invite')
    } else {
      setMessage(`Invite sent to ${email}`)
      setEmail('')
      setNote('')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={sendInvite} className="bg-white border border-slate-200 rounded-lg p-5 mb-6">
      <div className="mb-4">
        <h2 className="font-semibold text-slate-900">Send invite</h2>
        <p className="text-sm text-slate-500 mt-1">Invite-only onboarding email powered by Resend. The recipient still signs in through Supabase magic link.</p>
      </div>
      {message ? <div className="bg-emerald-50 text-emerald-700 text-sm px-3 py-2 rounded-lg mb-3">{message}</div> : null}
      {error ? <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg mb-3">{error}</div> : null}
      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <input className="input" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="invitee@example.com" />
        <select className="input" value={role} onChange={(event) => setRole(event.target.value)}>
          <option value="contributor">Contributor</option>
          <option value="seeker">Seeker</option>
          <option value="solution_provider">Solution provider</option>
          <option value="mentor">Mentor</option>
          <option value="partner">Partner</option>
          <option value="curator">Curator</option>
        </select>
      </div>
      <textarea className="textarea mt-3" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional internal note" />
      <button className="btn-primary mt-3" type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send invite'}</button>
    </form>
  )
}
