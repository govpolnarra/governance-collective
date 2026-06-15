import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isCuratorRole } from '@/lib/access'
import { sendInviteEmail } from '@/lib/email/resend'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (!isCuratorRole(profile?.role)) {
    return NextResponse.json({ error: 'Only curators and admins can send invites' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const email = String(body?.email ?? '').trim().toLowerCase()
  const role = String(body?.role ?? 'contributor')
  const note = body?.note ? String(body.note).trim() : null

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
  const inviteUrl = `${siteUrl}/login?email=${encodeURIComponent(email)}`

  const { error: dbError } = await supabase
    .from('invitations')
    .upsert({
      email,
      role,
      note,
      invited_by: user.id,
      status: 'sent',
      sent_at: new Date().toISOString(),
    }, { onConflict: 'email' })

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  try {
    await sendInviteEmail({
      email,
      invitedBy: profile?.full_name,
      role,
      inviteUrl,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not send invite email'
    await supabase
      .from('invitations')
      .update({ status: 'failed', note: note ? `${note}\n\nEmail error: ${message}` : `Email error: ${message}` })
      .eq('email', email)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
