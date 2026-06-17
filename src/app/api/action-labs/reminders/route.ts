import { NextResponse } from 'next/server'
import { forbidden, getRequestContext, isCurator } from '@/lib/api/auth'

export async function POST() {
  const ctx = await getRequestContext()
  if ('error' in ctx) return ctx.error
  if (!isCurator(ctx.profile)) return forbidden('Only curators can create review reminders')

  const { data, error } = await ctx.supabase.rpc('create_action_lab_review_reminders')
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ count: data ?? 0 })
}
