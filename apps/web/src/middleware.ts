import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCsrfSecret, generateCsrfToken, setCsrfCookie } from '@/lib/csrf';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Get or generate CSRF secret
  const secret = getCsrfSecret(request);

  // Set CSRF secret cookie
  setCsrfCookie(response, secret);

  // Generate token for this request
  const token = generateCsrfToken(secret);

  // Add CSRF token to response headers for client-side access
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
