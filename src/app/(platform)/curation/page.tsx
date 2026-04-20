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

  // Enrich each queue item with a human-readable title by fetching from the source table
  const enriched = await Promise.all(
    (queue ?? []).map(async (item) => {
      let title = item.content_id // fallback
      let contentHref = '#'

      if (item.content_type === 'playbook') {
        const { data } = await supabase.from('playbooks').select('title').eq('id', item.content_id).single()
        if (data) { title = data.title; contentHref = `/playbooks/${item.content_id}` }
      } else if (item.content_type === 'solution') {
        const { data } = await supabase.from('solutions').select('name').eq('id', item.content_id).single()
        if (data) { title = data.name; contentHref = `/solutions/${item.content_id}` }
      } else if (item.content_type === 'learning_resource') {
        const { data } = await supabase.from('learning_resources').select('title').eq('id', item.content_id).single()
        if (data) { title = data.title; contentHref = `/learning/${item.content_id}` }
      } else if (item.content_type === 'request') {
        const { data } = await supabase.from('requests').select('title').eq('id', item.content_id).single()
        if (data) { title = data.title; contentHref = `/requests/${item.content_id}` }
      }

      return { ...item, contentTitle: title, contentHref }
    })
  )

  return <CurationClient queue={enriched} userRole={profile.role} />
}
