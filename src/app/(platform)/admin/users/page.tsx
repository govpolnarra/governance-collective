import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminRole, roleLabel } from '@/lib/access'
import InviteUserForm from './InviteUserForm'
import UserManagementTable from './UserManagementTable'

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
    .select('id,full_name,email,organisation,role,access_tier,is_approved,password_set,created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const { data: invitations } = await supabase
    .from('invitations')
    .select('id,email,role,status,note,sent_at,accepted_at,created_at')
    .order('created_at', { ascending: false })
    .limit(25)

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">User Approvals</h1>
        <p className="text-slate-500 mt-1">Review approval, role, access-tier state, and send invite-only onboarding emails.</p>
      </div>

      <InviteUserForm />

      <UserManagementTable profiles={(profiles ?? []) as any[]} />

      <div className="mt-8 bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Recent invites</h2>
          <p className="text-sm text-slate-500">Last 25 invite records, including failed sends and accepted invites.</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Sent</th>
              <th className="px-4 py-3 font-medium">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(invitations ?? []).map((invite: any) => (
              <tr key={invite.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{invite.email}</td>
                <td className="px-4 py-3 capitalize text-slate-600">{roleLabel(invite.role)}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">{invite.status}</span>
                </td>
                <td className="px-4 py-3 text-slate-500">{invite.sent_at ? new Date(invite.sent_at).toLocaleString('en-IN') : 'Not sent'}</td>
                <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{invite.note ?? ''}</td>
              </tr>
            ))}
            {(invitations ?? []).length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No invites yet.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
