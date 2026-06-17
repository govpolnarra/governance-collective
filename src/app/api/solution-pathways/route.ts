import { NextRequest, NextResponse } from 'next/server'
import { forbidden, getRequestContext, isTrusted } from '@/lib/api/auth'

function listFromText(value: unknown) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value !== 'string') return []
  return value.split('\n').map((item) => item.trim()).filter(Boolean)
}

export async function POST(request: NextRequest) {
  const ctx = await getRequestContext()
  if ('error' in ctx) return ctx.error
  if (!isTrusted(ctx.profile)) return forbidden('Trusted access is required to create a pathway')

  const body = await request.json()
  const status = body.submit_for_review ? 'under_review' : 'draft'
  const { data, error } = await ctx.admin
    .from('solution_pathways')
    .insert({
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
      status,
      created_by: ctx.user.id,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  if (status === 'under_review') {
    const { error: queueError } = await ctx.admin.from('curation_queue').insert({
      content_id: data.id,
      content_type: 'solution_pathway',
      submitted_by: ctx.user.id,
      status: 'pending_review',
    })
    if (queueError) return NextResponse.json({ error: queueError.message }, { status: 400 })
  }

  return NextResponse.json({ id: data.id })
}
