'use client'

import { useState } from 'react'

export default function ReviewReminderButton() {
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function createReminders() {
    setLoading(true)
    setMessage(null)
    const response = await fetch('/api/action-labs/reminders', { method: 'POST' })
    const result = await response.json()
    setLoading(false)
    if (!response.ok) {
      setMessage(result.error || 'Could not create reminders')
      return
    }
    setMessage(`${result.count} reminder${result.count === 1 ? '' : 's'} created`)
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button className="btn-secondary" type="button" onClick={createReminders} disabled={loading}>
        {loading ? 'Checking...' : 'Create review reminders'}
      </button>
      {message ? <p className="text-xs text-slate-500">{message}</p> : null}
    </div>
  )
}
