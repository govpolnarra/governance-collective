import { NextRequest, NextResponse } from 'next/server'
import { forbidden, getRequestContext, isTrusted } from '@/lib/api/auth'

function listFromText(value: unknown) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value !== 'string') return []
  return value.split('\n').map((item) => item.trim()).filter(Boolean)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getRequestContext()
  if ('error' in ctx) return ctx.error
  if (!isTrusted(ctx.profile)) return forbidden('Trusted access is required to update a pathway')

  const { id } = await params
  const body = await request.json()
  const { data: pathway } = await ctx.admin
    .from('solution_pathways')
    .select('created_by,status')
    .eq('id', id)
    .single()

  const canEdit = pathway?.created_by === ctx.user.id || ctx.profile.role === 'curator' || ctx.profile.role === 'admin'
  if (!canEdit) return forbidden('Only the pathway creator or curators can edit this pathway')

  const nextStatus = body.submit_for_review ? 'under_review' : (body.status || pathway?.status || 'draft')
  const { error } = await ctx.admin
    .from('solution_pathways')
    .update({
      title: body.title || 'Untitled pathway',
      problem_statement: body.problem_statement || null,
      root_cause: body.root_cause || null,
      actors: body.actors || null,
      government_levers: listFromText(body.government_levers),
      solution_ids: Array.isArray(body.solution_ids) ? body.solution_ids.filter(Boolean) : [],
      expert_ids: Array.isArray(body.expert_ids) ? body.expert_ids.filter(Boolean) : [],
      possible_solutions: body.possible_solutions || null,
      risks: body.risks || null,
      adoption_conditions: body.adoption_conditions || null,
      architecture_summary: body.architecture_summary || null,
      actor_changes: body.actor_changes || null,
      sequence: body.sequence || null,
      measurement_plan: body.measurement_plan || null,
      district_id: body.district_id || null,
      action_lab_id: body.action_lab_id || null,
      visibility: body.visibility || 'trusted',
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  if (body.submit_for_review) {
    const { data: existing } = await ctx.admin
      .from('curation_queue')
      .select('id')
      .eq('content_id', id)
      .eq('content_type', 'solution_pathway')
      .in('status', ['pending_review', 'revision_requested'])
      .maybeSingle()

    if (!existing) {
      const { error: queueError } = await ctx.admin.from('curation_queue').insert({
        content_id: id,
        content_type: 'solution_pathway',
        submitted_by: ctx.user.id,
        status: 'pending_review',
      })
      if (queueError) return NextResponse.json({ error: queueError.message }, { status: 400 })
    }
  }

  return NextResponse.json({ id })
}
