import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendMagicLinkEmail } from '@/lib/email/resend'

type EmailResult = {
  error?: {
    message?: string
    name?: string
  } | null
}

type LinkProperties = {
  hashed_token?: string
  verification_type?: string
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const email = String(body?.email ?? '').trim().toLowerCase()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin).replace(/\/$/, '')
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

  const properties = data.properties as LinkProperties | undefined
  const tokenHash = properties?.hashed_token
  const verificationType = properties?.verification_type || 'email'
  if (!tokenHash) {
    return NextResponse.json({ error: 'Could not generate sign-in link' }, { status: 500 })
  }
  const actionLink = `${redirectTo}?token_hash=${encodeURIComponent(tokenHash)}&type=${encodeURIComponent(verificationType)}`

  try {
    const sendResult = await sendMagicLinkEmail({ email, actionLink }) as EmailResult
    if (sendResult.error) {
      return NextResponse.json(
        { error: sendResult.error.message || sendResult.error.name || 'Could not send magic link email' },
        { status: 502 }
      )
    }
  } catch (sendError) {
    const message = sendError instanceof Error ? sendError.message : 'Could not send magic link email'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
