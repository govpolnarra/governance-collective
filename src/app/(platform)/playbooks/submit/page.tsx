'use client'
import { useState, FormEvent } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const SECTORS = ['Health','Education','Agriculture','Water & Sanitation','Finance','Urban Development','Environment','Governance','Other']

export default function SubmitPlaybookPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', summary: '', sector: '', body: '' })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { error } = await supabase.from('playbooks').insert({
      ...form,
      author_id: user.id,
      status: 'pending'
    })
    if (!error) router.push('/playbooks')
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-ink mb-2">Submit a Playbook</h1>
      <p className="text-slate-500 mb-6">Share field-tested knowledge with the community. Submissions go through curation before publishing.</p>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="label">Title</label>
          <input required className="input w-full" placeholder="e.g. Running community water audits in rural Maharashtra" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
        </div>
        <div>
          <label className="label">Sector</label>
          <select required className="input w-full" value={form.sector} onChange={(e) => setForm({...form, sector: e.target.value})}>
            <option value="">Select a sector</option>
            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Summary</label>
          <input required className="input w-full" placeholder="One-line description" value={form.summary} onChange={(e) => setForm({...form, summary: e.target.value})} />
        </div>
        <div>
          <label className="label">Content</label>
          <textarea required rows={10} className="input w-full" placeholder="Describe the method, context, steps, and lessons learned..." value={form.body} onChange={(e) => setForm({...form, body: e.target.value})} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Submitting...' : 'Submit for Review'}
        </button>
      </form>
    </div>
  )
}
