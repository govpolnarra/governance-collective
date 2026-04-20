'use client'
import { useState, FormEvent } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const SECTORS = [
  'Health', 'Education', 'Agriculture', 'Water & Sanitation',
  'Finance', 'Urban Development', 'Environment', 'Governance', 'Other'
]

export default function SubmitSolutionPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '', summary: '', sector: '',
    problem_addressed: '', implementation_details: '', outcomes: '', tags: ''
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    const { error: insertError } = await supabase.from('solutions').insert({
      title: form.title,
      summary: form.summary,
      sector: form.sector || null,
      problem_addressed: form.problem_addressed || null,
      implementation_details: form.implementation_details || null,
      outcomes: form.outcomes || null,
      tags: tagsArray,
      author_id: user.id,
      status: 'draft'
    })

    if (insertError) { setError(insertError.message); setLoading(false); return }
    router.push('/solutions')
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))
  })

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Submit a Solution</h1>
        <p className="text-slate-500 mt-1">
          Share a governance solution you&apos;ve implemented. Help others facing the same challenges.
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
            Solution Name <span className="text-red-500">*</span>
          </label>
          <input
            required
            className="input w-full"
            placeholder="e.g. Digital grievance portal for municipal complaints"
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
            placeholder="What does this solution do?"
            {...field('summary')}
          />
        </div>

        <div>
          <label className="label">
            Sector <span className="text-red-500">*</span>
          </label>
          <select required className="input w-full" {...field('sector')}>
            <option value="">Select sector</option>
            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Problem Addressed</label>
          <textarea
            rows={3}
            className="input w-full"
            placeholder="What specific governance problem does this solve?"
            {...field('problem_addressed')}
          />
        </div>

        <div>
          <label className="label">Implementation Details</label>
          <textarea
            rows={4}
            className="input w-full"
            placeholder="How was it implemented? Key steps, stakeholders, resources needed"
            {...field('implementation_details')}
          />
        </div>

        <div>
          <label className="label">Outcomes</label>
          <textarea
            rows={3}
            className="input w-full"
            placeholder="Measured results or impact"
            {...field('outcomes')}
          />
        </div>

        <div>
          <label className="label">Tags</label>
          <input
            className="input w-full"
            placeholder="Comma-separated: transparency, grievance, portal"
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
