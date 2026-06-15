import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

const fallbackUrl = 'http://127.0.0.1:54321';
const fallbackAnonKey = 'missing-local-anon-key';

export function createClient() {
  return createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || fallbackAnonKey
  );
}

// Alias for backwards compatibility
export const createBrowserClient = createClient;
