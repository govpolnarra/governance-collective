'use client'
import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SubmitLearningPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', type: 'insight' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { error } = await supabase.from('learning_logs').insert({
      ...form,
      author_id: user.id,
      status: 'pending'
    })
    if (!error) router.push('/learning')
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-ink mb-2">Share a Learning</h1>
      <p className="text-slate-500 mb-6">Share an insight, mistake, or lesson from working with or in government.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Type</label>
          <select className="input w-full" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
            <option value="insight">Insight</option>
            <option value="mistake">Mistake / Lesson</option>
            <option value="tool">Tool or Method</option>
            <option value="story">Story</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Title</label>
          <input required className="input w-full" placeholder="A concise title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Content</label>
          <textarea required rows={8} className="input w-full" placeholder="Share your learning..." value={form.body} onChange={e => setForm({...form, body: e.target.value})} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Submitting...' : 'Submit for Review'}
        </button>
      </form>
    </div>
  )
}
