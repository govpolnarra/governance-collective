'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const supabase = createBrowserClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [form, setForm] = useState({ full_name: '', bio: '', role: '', organisation: '' })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        if (data) {
          setProfile(data)
          setForm({ full_name: data.full_name || '', bio: data.bio || '', role: data.role || '', organisation: data.organisation || '' })
        }
      })
    })
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').update(form).eq('id', user!.id)
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!profile) return <div className="p-6 text-slate-400">Loading...</div>

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-ink">Your Profile</h1>
        <button onClick={handleSignOut} className="text-sm text-slate-500 hover:text-red-500">Sign Out</button>
      </div>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Full Name</label>
          <input className="input w-full" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Role</label>
          <input className="input w-full" placeholder="e.g. Programme Manager, IAS Officer" value={form.role} onChange={e => setForm({...form, role: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Organisation</label>
          <input className="input w-full" placeholder="Your department or organisation" value={form.organisation} onChange={e => setForm({...form, organisation: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Bio</label>
          <textarea rows={4} className="input w-full" placeholder="Tell the community about yourself" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
