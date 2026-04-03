import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Validate redirect path to prevent open redirect attacks.
 * Only allows relative paths starting with /.
 */
function sanitizeRedirect(redirect: string | null): string {
  if (!redirect) return '/';
  // Must start with / and must not start with // (protocol-relative URL)
  if (!redirect.startsWith('/') || redirect.startsWith('//')) return '/';
  // Strip any protocol attempts
  try {
    const url = new URL(redirect, 'http://localhost');
    if (url.hostname !== 'localhost') return '/';
  } catch {
    return '/';
  }
  return redirect;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirect = sanitizeRedirect(searchParams.get('redirect'));

  if (code) {
    const response = NextResponse.redirect(new URL(redirect, origin));

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }
  }

  return NextResponse.redirect(new URL('/auth/confirm', origin));
}
