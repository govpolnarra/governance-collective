import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const fallbackUrl = 'http://127.0.0.1:54321';
const fallbackAnonKey = 'missing-local-anon-key';
type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || fallbackAnonKey,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Public routes — always allow
  const publicRoutes = ['/', '/login', '/auth/callback', '/api/auth/magic-link'];
  if (publicRoutes.includes(pathname)) return supabaseResponse;

  // Unauthenticated → redirect to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Fetch profile once for all role/approval checks
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_approved, password_set')
    .eq('id', user.id)
    .single();

  // Invite-only gate: if is_approved is false, redirect to a pending-approval page
  // (except admins/curators are always allowed through)
  if (
    profile &&
    profile.is_approved === false &&
    !['curator', 'admin'].includes(profile.role ?? '')
  ) {
    // Only block non-public, non-pending pages
    if (pathname !== '/pending-approval') {
      const url = request.nextUrl.clone();
      url.pathname = '/pending-approval';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  if (
    profile?.is_approved !== false &&
    profile?.password_set === false &&
    pathname !== '/set-password'
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/set-password';
    return NextResponse.redirect(url);
  }

  // Curator-only routes: /curation/*
  if (pathname.startsWith('/curation')) {
    if (!profile || !['curator', 'admin'].includes(profile.role ?? '')) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
