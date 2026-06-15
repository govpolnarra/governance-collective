import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminRole, roleLabel } from '@/lib/access'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!isAdminRole(currentProfile?.role)) redirect('/dashboard')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id,full_name,email,organisation,role,access_tier,is_approved,created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">User Approvals</h1>
        <p className="text-slate-500 mt-1">Review approval, role, and access-tier state. Role updates can be wired here after the first production policy review.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Organisation</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Access</th>
              <th className="px-4 py-3 font-medium">Approval</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(profiles ?? []).map((profile: any) => (
              <tr key={profile.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{profile.full_name ?? 'Unnamed user'}</p>
                  <p className="text-xs text-slate-400">{profile.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{profile.organisation ?? 'Not listed'}</td>
                <td className="px-4 py-3 capitalize text-slate-600">{roleLabel(profile.role)}</td>
                <td className="px-4 py-3 text-slate-600">{profile.access_tier ?? 'registered'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${profile.is_approved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{profile.is_approved ? 'Approved' : 'Pending'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
