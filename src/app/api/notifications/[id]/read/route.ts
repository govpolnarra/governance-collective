import { NextResponse } from 'next/server'
import { getRequestContext } from '@/lib/api/auth'

export async function PATCH(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getRequestContext()
  if ('error' in ctx) return ctx.error

  const { id } = await params
  const { error } = await ctx.supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
    .eq('recipient_id', ctx.user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
