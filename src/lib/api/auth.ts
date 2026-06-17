import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export async function getRequestContext() {
  const supabase = await createClient()
  const admin = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, access_tier, is_approved')
    .eq('id', user.id)
    .single()

  if (!profile?.is_approved && profile?.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Account is not approved yet' }, { status: 403 }) }
  }

  return { supabase, admin, user, profile }
}

export function isTrusted(profile: { role?: string | null; access_tier?: string | null } | null | undefined) {
  return profile?.access_tier === 'trusted'
    || profile?.access_tier === 'internal'
    || profile?.role === 'curator'
    || profile?.role === 'admin'
}

export function isCurator(profile: { role?: string | null } | null | undefined) {
  return profile?.role === 'curator' || profile?.role === 'admin'
}

export function forbidden(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 })
}
