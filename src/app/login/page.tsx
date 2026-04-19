'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">GC</span>
          </div>
          <h1 className="text-2xl font-bold text-ink">Governance Collective</h1>
          <p className="text-slate-500 mt-2 text-sm">Sign in with your invited email</p>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-4xl mb-4">✉️</div>
              <h2 className="font-semibold text-ink mb-2">Check your email</h2>
              <p className="text-sm text-slate-600">We sent a magic link to <strong>{email}</strong>. Click it to sign in.</p>
              <button onClick={() => setSent(false)} className="mt-4 text-sm text-brand-600 hover:underline">Use a different email</button>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@example.com"
                  required
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Sending...' : 'Send magic link'}
              </button>
              <p className="text-xs text-slate-500 text-center">
                This platform is invite-only. Only invited emails can sign in.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
