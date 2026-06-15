'use client';
import { useEffect, useState, FormEvent } from 'react';
import { createBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'magic' | 'password'>('magic');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const authConfigured = isSupabaseConfigured();
  const supabase = createBrowserClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    const messageParam = params.get('message');
    if (emailParam) setEmail(emailParam);
    if (messageParam) setError(messageParam);
  }, []);

  function friendlyAuthError(message: string) {
    const lower = message.toLowerCase();
    if (lower.includes('rate') || lower.includes('too many')) {
      return 'Email sign-in is temporarily rate limited for this address. Use password sign-in if you have set one, or wait a few minutes before requesting another magic link.';
    }
    if (lower.includes('invalid login credentials')) {
      return 'That email/password combination was not recognised. If this is your first login, use a magic link first, then set a password from Profile.';
    }
    return message;
  }

  async function handleMagicLink(e: FormEvent) {
    e.preventDefault();
    if (!authConfigured) {
      setError('Authentication is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${SITE_URL}/auth/callback`,
      },
    });
    if (error) {
      setError(friendlyAuthError(error.message));
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  async function handlePasswordSignIn(e: FormEvent) {
    e.preventDefault();
    if (!authConfigured) {
      setError('Authentication is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(friendlyAuthError(error.message));
      setLoading(false);
      return;
    }
    window.location.href = '/dashboard';
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
          <p className="text-slate-500 text-sm">Invite-only access for governance problem-solvers</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg">{error}</div>
        )}

        {!authConfigured && (
          <div className="bg-amber-50 text-amber-800 text-sm px-4 py-3 rounded-lg">
            Auth environment variables are missing. Magic links will work once Supabase URL and anon key are configured.
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => { setMode('magic'); setError(''); }}
            className={`rounded-md px-3 py-2 text-sm font-medium ${mode === 'magic' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            Magic link
          </button>
          <button
            type="button"
            onClick={() => { setMode('password'); setError(''); }}
            className={`rounded-md px-3 py-2 text-sm font-medium ${mode === 'password' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            Password
          </button>
        </div>

        <form onSubmit={mode === 'magic' ? handleMagicLink : handlePasswordSignIn} className="space-y-4">
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

          {mode === 'password' && (
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="input w-full"
              />
              <p className="text-xs text-slate-400 mt-1">First login still happens by magic link. Set your password from Profile after entering.</p>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? (mode === 'magic' ? 'Sending...' : 'Signing in...') : (mode === 'magic' ? 'Send Magic Link' : 'Sign in with Password')}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          By signing in, you agree to our terms. This is an invite-only platform.
        </p>
      </div>
    </div>
  );
}
