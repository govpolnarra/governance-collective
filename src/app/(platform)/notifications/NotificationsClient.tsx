'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NotificationsClient({ notifications }: { notifications: any[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)

  async function markRead(id: string) {
    setBusy(id)
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
    setBusy(null)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <div key={notification.id} className={`bg-white border rounded-lg p-4 ${notification.read_at ? 'border-slate-200' : 'border-brand-200'}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900">{notification.title}</p>
              {notification.body ? <p className="text-sm text-slate-600 mt-1">{notification.body}</p> : null}
              <p className="text-xs text-slate-400 mt-2">{new Date(notification.created_at).toLocaleString('en-IN')}</p>
            </div>
            {!notification.read_at ? (
              <button className="text-xs text-brand-700 hover:underline shrink-0" type="button" onClick={() => markRead(notification.id)} disabled={busy === notification.id}>
                {busy === notification.id ? 'Marking...' : 'Mark read'}
              </button>
            ) : null}
          </div>
          {notification.href ? <Link href={notification.href} className="inline-block text-sm text-brand-700 hover:underline mt-3">Open</Link> : null}
        </div>
      ))}
      {notifications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
          <p className="font-medium text-slate-700">No notifications yet.</p>
          <p className="text-sm text-slate-400 mt-1">Review updates and Action Lab reminders will appear here.</p>
        </div>
      ) : null}
    </div>
  )
}
