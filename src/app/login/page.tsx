'use client';
import { useState, FormEvent } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const supabase = createBrowserClient();

  async function handleMagicLink(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${SITE_URL}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-white rounded-xl border border-slate-200 p-8 w-full max-w-sm text-center space-y-4">
          <div className="text-4xl">✉️</div>
          <h2 className="text-xl font-semibold text-slate-900">Check your email</h2>
          <p className="text-slate-500 text-sm">
            We sent a magic link to <strong>{email}</strong>. Click it to sign in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-white rounded-xl border border-slate-200 p-8 w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm mx-auto">
            GC
          </div>
          <h1 className="text-xl font-bold text-slate-900">Governance Collective</h1>
          <p className="text-slate-500 text-sm">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg">{error}</div>
        )}

        <form onSubmit={handleMagicLink} className="space-y-4">
          <div>
            <label className="label">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input w-full"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          By signing in, you agree to our terms. This is an invite-only platform.
        </p>
      </div>
    </div>
  );
}
