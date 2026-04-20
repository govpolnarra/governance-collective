'use client'
import { useState, useEffect, FormEvent } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/lib/types/database'

export default function ProfilePage() {
  const supabase = createBrowserClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    full_name: '', bio: '', organisation: '', location: '', linkedin_url: '', expertise: ''
  })
  const [role, setRole] = useState('')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('profiles')
        .select('full_name, bio, organisation, location, linkedin_url, expertise, role')
        .eq('id', user.id)
        .single()
      if (data) {
        setForm({
          full_name: data.full_name ?? '',
          bio: data.bio ?? '',
          organisation: data.organisation ?? '',
          location: data.location ?? '',
          linkedin_url: data.linkedin_url ?? '',
          expertise: (data.expertise ?? []).join(', ')
        })
        setRole(data.role ?? 'member')
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    const expertiseArray = form.expertise.split(',').map(s => s.trim()).filter(Boolean)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        bio: form.bio || null,
        organisation: form.organisation || null,
        location: form.location || null,
        linkedin_url: form.linkedin_url || null,
        expertise: expertiseArray,
      })
      .eq('id', userId)
    if (updateError) { setError(updateError.message); setSaving(false); return }
    setSuccess(true)
    setSaving(false)
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))
  })

  if (loading) return <div className="max-w-2xl mx-auto p-6 text-slate-400">Loading profile...</div>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Profile</h1>
          <p className="text-slate-500 mt-0.5">
            Role: <span className="capitalize font-medium text-emerald-700">{role}</span>
          </p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg p-3 mb-4">✓ Profile saved successfully.</div>}

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="label">Full Name <span className="text-red-500">*</span></label>
          <input required className="input w-full" placeholder="Your full name" {...field('full_name')} />
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea rows={3} className="input w-full" placeholder="A short description of your work and background" {...field('bio')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Organisation</label>
            <input className="input w-full" placeholder="Your organisation" {...field('organisation')} />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input w-full" placeholder="City, State" {...field('location')} />
          </div>
        </div>
        <div>
          <label className="label">LinkedIn URL</label>
          <input type="url" className="input w-full" placeholder="https://linkedin.com/in/yourprofile" {...field('linkedin_url')} />
        </div>
        <div>
          <label className="label">Areas of Expertise</label>
          <input className="input w-full" placeholder="Comma-separated: WASH, nutrition, CSR, program evaluation" {...field('expertise')} />
          <p className="text-xs text-slate-400 mt-1">Separate multiple areas with commas</p>
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
