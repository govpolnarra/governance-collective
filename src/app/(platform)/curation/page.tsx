import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CurationClient from './CurationClient'

export default async function CurationQueuePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['curator', 'admin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  const { data: queue } = await supabase
    .from('curation_queue')
    .select('*, profiles!curation_queue_submitted_by_fkey(full_name, organisation)')
    .eq('status', 'pending_review')
    .order('created_at', { ascending: true })

  return <CurationClient queue={queue ?? []} userRole={profile.role} />
}
