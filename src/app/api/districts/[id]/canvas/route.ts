import { NextRequest, NextResponse } from 'next/server'
import { forbidden, getRequestContext, isTrusted } from '@/lib/api/auth'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getRequestContext()
  if ('error' in ctx) return ctx.error
  if (!isTrusted(ctx.profile)) return forbidden('Trusted access is required to update a District Canvas')

  const { id } = await params
  const body = await request.json()
  const { data, error } = await ctx.admin
    .from('district_canvas_entries')
    .insert({
      district_id: id,
      entry_type: body.entry_type || 'context_note',
      title: body.title,
      description: body.description || null,
      status: body.status || 'active',
      visibility: body.visibility || 'trusted',
      created_by: ctx.user.id,
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ entry: data })
}
