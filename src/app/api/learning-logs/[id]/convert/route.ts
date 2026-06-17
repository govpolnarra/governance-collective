import { NextRequest, NextResponse } from 'next/server'
import { forbidden, getRequestContext, isTrusted } from '@/lib/api/auth'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getRequestContext()
  if ('error' in ctx) return ctx.error
  if (!isTrusted(ctx.profile)) return forbidden('Trusted access is required to convert learning')

  const { id } = await params
  const body = await request.json()
  const type = body.type as 'playbook' | 'learning_resource' | 'request' | 'solution_pathway'
  const { data: log, error: logError } = await ctx.admin
    .from('learning_logs')
    .select('*, action_labs(title, problem_statement, district_id, districts(district_name,state))')
    .eq('id', id)
    .single()

  if (logError || !log) return NextResponse.json({ error: logError?.message || 'Learning log not found' }, { status: 404 })

  const lab = Array.isArray(log.action_labs) ? log.action_labs[0] : log.action_labs
  const title = body.title || `${lab?.title || 'Action Lab'} learning`
  let created: { id: string } | null = null
  let contentType = type
  let href = '/my-submissions'
  let statusForQueue: string | null = 'pending_review'

  if (type === 'playbook') {
    const { data, error } = await ctx.admin.from('playbooks').insert({
      title,
      summary: log.what_was_learned,
      problem_statement: lab?.problem_statement || null,
      approach: log.what_was_tried,
      what_happened: log.what_was_observed,
      what_failed_or_surprised: log.blockers,
      outcomes: log.what_changes_next,
      district: lab?.districts?.district_name || null,
      state: lab?.districts?.state || null,
      author_id: ctx.user.id,
      status: 'pending_review',
      visibility: 'trusted',
    }).select('id').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    created = data
    href = `/playbooks/${data.id}`
  } else if (type === 'learning_resource') {
    const { data, error } = await ctx.admin.from('learning_resources').insert({
      title,
      summary: log.what_was_learned,
      body: [log.what_was_tried, log.what_was_observed, log.what_changes_next].filter(Boolean).join('\n\n'),
      resource_type: 'field_note',
      derived_from_type: 'learning_log',
      derived_from_id: id,
      author_id: ctx.user.id,
      status: 'pending_review',
      visibility: 'trusted',
    }).select('id').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    created = data
    href = `/learning/${data.id}`
  } else if (type === 'request') {
    const { data, error } = await ctx.admin.from('requests').insert({
      title,
      description: log.support_needed || log.blockers || log.what_changes_next,
      need_type: 'mentor_support',
      problem_context: lab?.problem_statement || log.what_was_observed,
      district: lab?.districts?.district_name || null,
      state: lab?.districts?.state || null,
      author_id: ctx.user.id,
      status: 'open',
      visibility: 'trusted',
    }).select('id').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    created = data
    contentType = 'request'
    statusForQueue = null
    href = `/requests/${data.id}`
  } else if (type === 'solution_pathway') {
    const { data, error } = await ctx.admin.from('solution_pathways').insert({
      title,
      problem_statement: lab?.problem_statement || null,
      district_id: lab?.district_id || null,
      action_lab_id: log.action_lab_id,
      architecture_summary: log.what_was_learned,
      root_cause: log.what_was_observed,
      possible_solutions: log.what_changes_next,
      risks: log.blockers,
      adoption_conditions: log.support_needed,
      created_by: ctx.user.id,
      status: 'under_review',
      visibility: 'trusted',
    }).select('id').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    created = data
    href = `/solution-studio/${data.id}`
  } else {
    return NextResponse.json({ error: 'Unsupported conversion type' }, { status: 400 })
  }

  if (created && statusForQueue) {
    const { error: queueError } = await ctx.admin.from('curation_queue').insert({
      content_id: created.id,
      content_type: contentType,
      submitted_by: ctx.user.id,
      status: statusForQueue,
    })
    if (queueError) return NextResponse.json({ error: queueError.message }, { status: 400 })
  }

  if (created) {
    await ctx.admin
      .from('learning_logs')
      .update({ converted_to_type: contentType, converted_to_id: created.id, updated_at: new Date().toISOString() })
      .eq('id', id)
  }

  return NextResponse.json({ id: created?.id, href })
}
