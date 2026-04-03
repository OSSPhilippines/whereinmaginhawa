import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getCsrfSecret, generateCsrfToken, setCsrfCookie } from '@/lib/csrf';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // --- Supabase session refresh ---
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // --- Auth code exchange (magic link / OAuth) ---
  // When a user clicks a magic link, Supabase redirects with ?code=<code>.
  // This can land on ANY page, so we handle it here in middleware.
  const code = request.nextUrl.searchParams.get('code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Build clean redirect URL
      const cleanUrl = new URL(request.nextUrl);
      cleanUrl.searchParams.delete('code');
      const redirect = request.nextUrl.searchParams.get('redirect');
      if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
        cleanUrl.pathname = redirect;
        cleanUrl.searchParams.delete('redirect');
      }
      // Create redirect and carry over the auth cookies that were set on `response`
      const redirectResponse = NextResponse.redirect(cleanUrl);
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });
      return redirectResponse;
    }
    console.info('[middleware] Code exchange failed:', error.message);
  }

  // Refresh the session - this updates cookies if tokens were refreshed.
  // Wrapped in try/catch to handle "Lock broken by steal" errors that occur
  // when multiple concurrent requests (middleware + server components) race
  // to refresh the same session.
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (e) {
    // Suppress lock contention errors — the session will still work
    // because the cookies have already been refreshed by a parallel request.
    if (!(e instanceof Error && e.message.includes('Lock'))) {
      throw e;
    }
  }

  // --- Protected route checks ---
  const { pathname } = request.nextUrl;

  // Protect /dashboard/* and /admin/* routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect logged-in users away from auth pages
  if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup')) {
    if (user) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // --- CSRF token logic (preserved from original) ---
  const secret = getCsrfSecret(request);
  setCsrfCookie(response, secret);
  const token = generateCsrfToken(secret);
  response.headers.set('x-csrf-token', token);

  return response;
}

// Apply middleware to all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
