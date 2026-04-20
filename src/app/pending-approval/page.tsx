import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PendingApprovalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // If already approved, send to dashboard
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_approved, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.is_approved !== false) redirect('/dashboard')

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center space-y-5">
        <div className="text-5xl">⏳</div>
        <h1 className="text-2xl font-bold text-gray-900">Your account is pending approval</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Governance Collective is invite-only during Phase 1. Your account has been created and is
          awaiting review by an admin. You&apos;ll receive access once approved.
        </p>
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
          <p className="font-medium">What happens next?</p>
          <ul className="mt-2 space-y-1 text-left list-disc list-inside">
            <li>An admin will review your registration</li>
            <li>You&apos;ll get access to the platform once approved</li>
            <li>Reach out to your contact if you need faster access</li>
          </ul>
        </div>
        <form action={handleSignOut}>
          <button
            type="submit"
            className="text-sm text-gray-400 hover:text-gray-600 underline"
          >
            Sign out and use a different account
          </button>
        </form>
      </div>
    </div>
  )
}
