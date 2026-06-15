import { Resend } from 'resend'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'Governance Collective <onboarding@resend.dev>'
const replyTo = process.env.RESEND_REPLY_TO

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function emailShell({
  eyebrow,
  title,
  intro,
  ctaLabel,
  ctaUrl,
  children = '',
  footer = 'Governance Collective is an invite-only, human-curated space for practical governance problem-solving.',
}: {
  eyebrow: string
  title: string
  intro: string
  ctaLabel: string
  ctaUrl: string
  children?: string
  footer?: string
}) {
  return `
    <div style="margin:0;padding:0;background:#f4f6f2;font-family:Inter,Arial,sans-serif;color:#17201b">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f2;margin:0;padding:32px 16px">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #d7ded8;border-radius:18px;overflow:hidden">
              <tr>
                <td style="background:#111b16;padding:22px 24px;color:#ffffff">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="width:42px">
                        <div style="width:34px;height:34px;border-radius:10px;background:#ffffff;color:#111b16;font-weight:800;font-size:13px;line-height:34px;text-align:center">GC</div>
                      </td>
                      <td>
                        <div style="font-size:15px;font-weight:800;letter-spacing:-0.01em">Governance Collective</div>
                        <div style="font-size:12px;color:#b9c9c0;margin-top:2px">Curated source-of-truth for public problem-solving</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:30px 28px 8px">
                  <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#0f6b4f;font-weight:800;margin-bottom:10px">${eyebrow}</div>
                  <h1 style="font-size:28px;line-height:1.14;letter-spacing:-0.03em;margin:0 0 14px;color:#17201b">${title}</h1>
                  <p style="font-size:16px;line-height:1.6;color:#53615b;margin:0">${intro}</p>
                </td>
              </tr>
              ${children}
              <tr>
                <td style="padding:24px 28px 30px">
                  <a href="${ctaUrl}" style="display:inline-block;background:#0f6b4f;color:#ffffff;text-decoration:none;padding:13px 18px;border-radius:10px;font-size:14px;font-weight:800">${ctaLabel}</a>
                  <p style="font-size:12px;line-height:1.5;color:#7a8580;margin:18px 0 0">If the button does not work, copy this link into your browser:<br><span style="word-break:break-all;color:#53615b">${ctaUrl}</span></p>
                </td>
              </tr>
              <tr>
                <td style="background:#f9faf8;border-top:1px solid #d7ded8;padding:18px 28px">
                  <p style="font-size:12px;line-height:1.5;color:#65736d;margin:0">${footer}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `
}

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
  const roleLabel = role ? role.replaceAll('_', ' ') : null
  return resend.emails.send({
    from: fromEmail,
    to: email,
    replyTo,
    subject: 'Your invitation to Governance Collective',
    html: emailShell({
      eyebrow: 'Invitation',
      title: 'You have been invited to Governance Collective',
      intro: 'Governance Collective is an invite-only platform where fellows, officers, practitioners, mentors, and partners work from curated field evidence.',
      ctaLabel: 'Accept invitation',
      ctaUrl: inviteUrl,
      children: `
        <tr>
          <td style="padding:18px 28px 0">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#edf7f1;border:1px solid #cae3d6;border-radius:14px">
              <tr>
                <td style="padding:16px 18px">
                  <p style="font-size:14px;line-height:1.5;color:#235342;margin:0">
                    ${invitedBy ? `<strong>${escapeHtml(invitedBy)}</strong> invited you${roleLabel ? ` as a <strong>${escapeHtml(roleLabel)}</strong>` : ''}.` : 'A Governance Collective curator invited you.'}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `,
      footer: 'Publishing and access are reviewed by the Governance Initiative team. The platform is curated by design, not an open directory.',
    }),
    text: `You have been invited to Governance Collective. Open ${inviteUrl} to request your sign-in magic link.`,
  })
}

export async function sendMagicLinkEmail({
  email,
  actionLink,
}: {
  email: string
  actionLink: string
}) {
  const resend = getResend()
  return resend.emails.send({
    from: fromEmail,
    to: email,
    replyTo,
    subject: 'Sign in to Governance Collective',
    html: emailShell({
      eyebrow: 'Secure sign-in',
      title: 'Your Governance Collective sign-in link',
      intro: 'Use this one-time link to enter the platform. After your first login, you will be asked to set a password so email rate limits never block your access.',
      ctaLabel: 'Sign in securely',
      ctaUrl: actionLink,
      children: `
        <tr>
          <td style="padding:18px 28px 0">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fffdf7;border:1px solid #ead7a6;border-radius:14px">
              <tr>
                <td style="padding:16px 18px">
                  <p style="font-size:14px;line-height:1.5;color:#654b14;margin:0">
                    This link is single-use. If you did not request it, you can safely ignore this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `,
    }),
    text: `Sign in to Governance Collective: ${actionLink}`,
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
    html: emailShell({
      eyebrow: 'Welcome',
      title: `Welcome${name ? `, ${escapeHtml(name)}` : ''}`,
      intro: 'Your Governance Collective access is ready. Start from a problem, search curated evidence, or review live district and Action Lab workspaces.',
      ctaLabel: 'Open dashboard',
      ctaUrl: dashboardUrl,
    }),
    text: `Welcome to Governance Collective. Open ${dashboardUrl} to get started.`,
  })
}
