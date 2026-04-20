'use client'
import { useState, FormEvent } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const RESOURCE_TYPES = ['article', 'video', 'report', 'course', 'podcast', 'tool', 'other']

export default function SubmitLearningPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '', summary: '', resource_url: '', resource_type: 'article', tags: ''
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    const { error: insertError } = await supabase.from('learning_resources').insert({
      title: form.title,
      summary: form.summary,
      resource_url: form.resource_url || null,
      resource_type: form.resource_type,
      tags: tagsArray,
      author_id: user.id,
      status: 'draft'
    })

    if (insertError) { setError(insertError.message); setLoading(false); return }
    router.push('/learning')
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))
  })

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Submit a Learning Resource</h1>
        <p className="text-slate-500 mt-1">
          Share an article, video, report, or tool that others working in governance will find useful.
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
            placeholder="e.g. How to facilitate community consultations"
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
            placeholder="What will practitioners learn from this?"
            {...field('summary')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Resource Type</label>
            <select className="input w-full" {...field('resource_type')}>
              {RESOURCE_TYPES.map(t => (
                <option key={t} value={t} className="capitalize">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">URL</label>
            <input
              type="url"
              className="input w-full"
              placeholder="https://..."
              {...field('resource_url')}
            />
          </div>
        </div>

        <div>
          <label className="label">Tags</label>
          <input
            className="input w-full"
            placeholder="Comma-separated: facilitation, WASH, community"
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
