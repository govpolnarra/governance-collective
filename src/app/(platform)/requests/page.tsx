'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

export default function RequestsPage() {
  const supabase = createBrowserClient()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', type: 'help' })

  useEffect(() => {
    supabase.from('requests').select('*, profiles(full_name)').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setRequests(data)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data } = await supabase.from('requests').insert({
      ...form,
      requester_id: user.id
    }).select('*, profiles(full_name)').single()
    if (data) {
      setRequests([data, ...requests])
      setShowForm(false)
      setForm({ title: '', description: '', type: 'help' })
    }
    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-ink">Requests</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : 'Post a Request'}
        </button>
      </div>
      <p className="text-slate-500 mb-6">Ask the community for help, introductions, or resources.</p>
      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Request Title</label>
            <input required className="input w-full" placeholder="What do you need?" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Type</label>
            <select className="input w-full" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option value="help">Help / Advice</option>
              <option value="intro">Introduction</option>
              <option value="resource">Resource</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Details</label>
            <textarea required rows={4} className="input w-full" placeholder="Provide context..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Posting...' : 'Post Request'}</button>
        </form>
      )}
      <div className="space-y-4">
        {requests.length === 0 && <p className="text-slate-400 text-center py-8">No requests yet. Be the first!</p>}
        {requests.map((r: any) => (
          <div key={r.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase tracking-wide text-primary font-semibold">{r.type}</span>
                <h2 className="font-semibold text-ink mt-1">{r.title}</h2>
                <p className="text-sm text-slate-500 mt-1">{r.description}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">By {r.profiles?.full_name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
