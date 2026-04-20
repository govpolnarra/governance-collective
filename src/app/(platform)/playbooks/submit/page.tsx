'use client'
import { useState, FormEvent } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const SECTORS = [
  'Health', 'Education', 'Agriculture', 'Water & Sanitation',
  'Finance', 'Urban Development', 'Environment', 'Governance', 'Other'
]
const STATES = [
  'Andhra Pradesh', 'Bihar', 'Chhattisgarh', 'Delhi', 'Gujarat', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab',
  'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal', 'Other'
]

export default function SubmitPlaybookPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '', summary: '', sector: '', state: '',
    problem_statement: '', approach: '', outcomes: '', tags: ''
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    const { error: insertError } = await supabase.from('playbooks').insert({
      title: form.title,
      summary: form.summary,
      sector: form.sector || null,
      state: form.state || null,
      problem_statement: form.problem_statement || null,
      approach: form.approach || null,
      outcomes: form.outcomes || null,
      tags: tagsArray,
      author_id: user.id,
      status: 'draft'
    })

    if (insertError) { setError(insertError.message); setLoading(false); return }
    router.push('/playbooks')
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))
  })

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Submit a Playbook</h1>
        <p className="text-slate-500 mt-1">
          Document a governance approach or methodology that has worked in the field.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="label">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            required
            className="input w-full"
            placeholder="e.g. Setting up a ward-level grievance committee"
            {...field('title')}
          />
        </div>

        <div>
          <label className="label">
            Summary <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            className="input w-full"
            placeholder="Brief overview of the playbook"
            {...field('summary')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Sector</label>
            <select className="input w-full" {...field('sector')}>
              <option value="">Select sector</option>
              {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">State</label>
            <select className="input w-full" {...field('state')}>
              <option value="">Select state</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Problem Statement</label>
          <textarea
            rows={3}
            className="input w-full"
            placeholder="What problem does this playbook address?"
            {...field('problem_statement')}
          />
        </div>

        <div>
          <label className="label">Approach</label>
          <textarea
            rows={4}
            className="input w-full"
            placeholder="Step-by-step approach or methodology used"
            {...field('approach')}
          />
        </div>

        <div>
          <label className="label">Outcomes</label>
          <textarea
            rows={3}
            className="input w-full"
            placeholder="What results or outcomes were achieved?"
            {...field('outcomes')}
          />
        </div>

        <div>
          <label className="label">Tags</label>
          <input
            className="input w-full"
            placeholder="Comma-separated: WASH, community, audit"
            {...field('tags')}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Submitting...' : 'Submit for Review'}
        </button>
      </form>
    </div>
  )
}
