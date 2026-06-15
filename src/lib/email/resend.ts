import { Resend } from 'resend'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'Governance Collective <onboarding@resend.dev>'
const replyTo = process.env.RESEND_REPLY_TO

function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured')
  }
  return new Resend(apiKey)
}

export async function sendInviteEmail({
  email,
  invitedBy,
  role,
  inviteUrl,
}: {
  email: string
  invitedBy?: string | null
  role?: string | null
  inviteUrl: string
}) {
  const resend = getResend()
  return resend.emails.send({
    from: fromEmail,
    to: email,
    replyTo,
    subject: 'Your invitation to Governance Collective',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#17201b;max-width:620px;margin:auto">
        <h1 style="font-size:24px;margin:0 0 12px">You have been invited to Governance Collective</h1>
        <p>Governance Collective is an invite-only, curated space for practical governance problem-solving.</p>
        ${invitedBy ? `<p><strong>${invitedBy}</strong> invited you${role ? ` as a ${role.replaceAll('_', ' ')}` : ''}.</p>` : ''}
        <p>Use the button below to request your sign-in magic link and complete access.</p>
        <p style="margin:28px 0">
          <a href="${inviteUrl}" style="background:#0f6b4f;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700">Open Governance Collective</a>
        </p>
        <p style="font-size:13px;color:#65736d">This is a curated platform. Access and publishing are reviewed by the Governance Initiative team.</p>
      </div>
    `,
    text: `You have been invited to Governance Collective. Open ${inviteUrl} to request your sign-in magic link.`,
  })
}

export async function sendWelcomeEmail({
  email,
  name,
  dashboardUrl,
}: {
  email: string
  name?: string | null
  dashboardUrl: string
}) {
  const resend = getResend()
  return resend.emails.send({
    from: fromEmail,
    to: email,
    replyTo,
    subject: 'Welcome to Governance Collective',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#17201b;max-width:620px;margin:auto">
        <h1 style="font-size:24px;margin:0 0 12px">Welcome${name ? `, ${name}` : ''}</h1>
        <p>Your Governance Collective access is ready.</p>
        <p>Start from a problem, search the Collective, or review live district and Action Lab workspaces.</p>
        <p style="margin:28px 0">
          <a href="${dashboardUrl}" style="background:#0f6b4f;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700">Open dashboard</a>
        </p>
      </div>
    `,
    text: `Welcome to Governance Collective. Open ${dashboardUrl} to get started.`,
  })
}
