'use client'
import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const SECTORS = ['Health','Education','Agriculture','Water & Sanitation','Finance','Urban Development','Environment','Governance','Other']

export default function SubmitSolutionPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', sector: '', website: '', tags: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { error } = await supabase.from('solution_profiles').insert({
      name: form.name,
      description: form.description,
      sector: form.sector,
      website: form.website,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      provider_id: user.id,
      status: 'pending'
    })
    if (!error) router.push('/solutions')
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-ink mb-2">List a Solution</h1>
      <p className="text-slate-500 mb-6">Submit your validated programme or tool for government practitioners to discover.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Solution Name</label>
          <input required className="input w-full" placeholder="Name of your solution or programme" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Sector</label>
          <select required className="input w-full" value={form.sector} onChange={e => setForm({...form, sector: e.target.value})}>
            <option value="">Select a sector</option>
            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Description</label>
          <textarea required rows={5} className="input w-full" placeholder="What does this solution do and where has it been implemented?" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Website (optional)</label>
          <input className="input w-full" placeholder="https://" value={form.website} onChange={e => setForm({...form, website: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Tags (comma-separated)</label>
          <input className="input w-full" placeholder="e.g. water, WASH, rural" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Submitting...' : 'Submit for Review'}
        </button>
      </form>
    </div>
  )
}
