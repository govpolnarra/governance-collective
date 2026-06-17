'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { roleLabel } from '@/lib/access'

type ProfileRow = {
  id: string
  full_name: string | null
  email: string | null
  organisation: string | null
  role: string | null
  access_tier: string | null
  is_approved: boolean | null
  password_set: boolean | null
  created_at: string | null
}

const roleOptions = ['member', 'contributor', 'seeker', 'solution_provider', 'mentor', 'partner', 'curator', 'admin']
const tierOptions = ['registered', 'trusted', 'internal']

export default function UserManagementTable({ profiles }: { profiles: ProfileRow[] }) {
  const router = useRouter()
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [error, setError] = useState('')

  async function updateProfile(id: string, updates: Record<string, unknown>) {
    setSaving((state) => ({ ...state, [id]: true }))
    setError('')
    const response = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(payload.error ?? 'Could not update user')
    } else {
      router.refresh()
    }
    setSaving((state) => ({ ...state, [id]: false }))
  }

  return (
    <div className="space-y-3">
      {error ? <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div> : null}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Organisation</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Access</th>
              <th className="px-4 py-3 font-medium">Approval</th>
              <th className="px-4 py-3 font-medium">Password</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {profiles.map((profile) => (
              <tr key={profile.id} className={saving[profile.id] ? 'opacity-60' : ''}>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{profile.full_name ?? 'Unnamed user'}</p>
                  <p className="text-xs text-slate-400">{profile.email ?? 'No email captured'}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{profile.organisation ?? 'Not listed'}</td>
                <td className="px-4 py-3">
                  <select
                    className="input min-w-40"
                    value={profile.role ?? 'contributor'}
                    disabled={saving[profile.id]}
                    onChange={(event) => updateProfile(profile.id, { role: event.target.value })}
                  >
                    {roleOptions.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    className="input min-w-32"
                    value={profile.access_tier ?? 'registered'}
                    disabled={saving[profile.id]}
                    onChange={(event) => updateProfile(profile.id, { access_tier: event.target.value })}
                  >
                    {tierOptions.map((tier) => <option key={tier} value={tier}>{tier}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={saving[profile.id]}
                    onClick={() => updateProfile(profile.id, { is_approved: !profile.is_approved })}
                    className={`text-xs px-2 py-1 rounded-full ${profile.is_approved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}
                  >
                    {profile.is_approved ? 'Approved' : 'Pending'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={saving[profile.id]}
                    onClick={() => updateProfile(profile.id, { password_set: !profile.password_set })}
                    className={`text-xs px-2 py-1 rounded-full ${profile.password_set ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                    title="Use this only for support corrections."
                  >
                    {profile.password_set ? 'Set' : 'Required'}
                  </button>
                </td>
              </tr>
            ))}
            {profiles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No profiles found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
