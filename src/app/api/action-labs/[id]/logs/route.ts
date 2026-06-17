import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext, isTrusted, forbidden } from '@/lib/api/auth'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getRequestContext()
  if ('error' in ctx) return ctx.error
  if (!isTrusted(ctx.profile)) return forbidden('Trusted access is required to add Action Lab learning')

  const { id } = await params
  const body = await request.json()
  const payload = {
    action_lab_id: id,
    log_type: body.log_type || 'weekly_log',
    date: body.date || new Date().toISOString().slice(0, 10),
    location: body.location || null,
    what_was_tried: body.what_was_tried || null,
    what_was_observed: body.what_was_observed || null,
    what_was_learned: body.what_was_learned || null,
    what_changes_next: body.what_changes_next || null,
    blockers: body.blockers || null,
    support_needed: body.support_needed || null,
    decision_notes: body.decision_notes || null,
    review_notes: body.review_notes || null,
    visibility: body.visibility || 'trusted',
    submitted_by: ctx.user.id,
  }

  const { data, error } = await ctx.admin.from('learning_logs').insert(payload).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  if (body.next_review_date || body.review_owner_id || body.lab_status || body.stage) {
    await ctx.admin
      .from('action_labs')
      .update({
        next_review_date: body.next_review_date || undefined,
        review_owner_id: body.review_owner_id || undefined,
        status: body.lab_status || undefined,
        stage: body.stage || undefined,
        review_notes: body.review_notes || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
  }

  return NextResponse.json({ log: data })
}
