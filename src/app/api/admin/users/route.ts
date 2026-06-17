import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { isAdminRole } from '@/lib/access'

const roles = ['member', 'contributor', 'seeker', 'solution_provider', 'mentor', 'partner', 'curator', 'admin']
const accessTiers = ['registered', 'trusted', 'internal']

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!isAdminRole(currentProfile?.role)) {
    return NextResponse.json({ error: 'Only admins can manage users' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const id = String(body?.id ?? '')
  if (!id) return NextResponse.json({ error: 'User id is required' }, { status: 400 })

  const updates: Record<string, unknown> = {}
  if (typeof body?.is_approved === 'boolean') updates.is_approved = body.is_approved
  if (typeof body?.password_set === 'boolean') updates.password_set = body.password_set
  if (roles.includes(body?.role)) updates.role = body.role
  if (accessTiers.includes(body?.access_tier)) updates.access_tier = body.access_tier

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid updates supplied' }, { status: 400 })
  }

  const admin = await createAdminClient()
  const { data, error } = await admin
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id,full_name,email,organisation,role,access_tier,is_approved,password_set,created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ profile: data })
}
