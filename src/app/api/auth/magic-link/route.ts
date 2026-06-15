import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendMagicLinkEmail } from '@/lib/email/resend'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const email = String(body?.email ?? '').trim().toLowerCase()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
  const redirectTo = `${siteUrl}/auth/callback`
  const supabase = await createAdminClient()

  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const actionLink = data.properties?.action_link
  if (!actionLink) {
    return NextResponse.json({ error: 'Could not generate sign-in link' }, { status: 500 })
  }

  try {
    await sendMagicLinkEmail({ email, actionLink })
  } catch (sendError) {
    const message = sendError instanceof Error ? sendError.message : 'Could not send magic link email'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
