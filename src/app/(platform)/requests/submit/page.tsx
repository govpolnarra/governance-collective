'use client'
import { useState, FormEvent } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const SECTORS = ['Health','Education','Agriculture','Water & Sanitation','Finance','Urban Development','Environment','Governance','Other']

export default function SubmitRequestPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '', description: '', sector: ''
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error: insertError } = await supabase.from('requests').insert({
      title: form.title,
      description: form.description,
      sector: form.sector || null,
      author_id: user.id,
      status: 'open'
    })

    if (insertError) { setError(insertError.message); setLoading(false); return }
    router.push('/requests')
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))
  })

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Post a Request</h1>
      <p className="text-slate-500 mb-6">Describe a governance challenge you&apos;re facing. The community can respond with knowledge, solutions, or connections.</p>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="label">Request Title <span className="text-red-500">*</span></label>
          <input required className="input w-full" placeholder="e.g. Need guidance on setting up a grievance redressal mechanism" {...field('title')} />
        </div>
        <div>
          <label className="label">Description <span className="text-red-500">*</span></label>
          <textarea required rows={5} className="input w-full" placeholder="Describe the challenge in detail. What have you tried? What specific help are you looking for?" {...field('description')} />
        </div>
        <div>
          <label className="label">Sector</label>
          <select className="input w-full" {...field('sector')}>
            <option value="">Select sector (optional)</option>
            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Posting...' : 'Post Request'}
        </button>
      </form>
    </div>
  )
}
