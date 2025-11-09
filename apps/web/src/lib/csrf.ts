import { NextRequest, NextResponse } from 'next/server';

const CSRF_TOKEN_HEADER = 'x-csrf-token';
// Use __Host- prefix in production (HTTPS), regular name in development
const CSRF_SECRET_COOKIE = process.env.NODE_ENV === 'production'
  ? '__Host-csrf-secret'
  : 'csrf-secret';

/**
 * Generate a random token using Web Crypto API
 * Compatible with both Node.js and Edge runtime
 */
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Simple constant-time string comparison
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Generate a CSRF token
 * In this simplified version, the secret IS the token
 */
export function generateCsrfToken(secret: string): string {
  return secret;
}

/**
 * Generate a CSRF secret
 */
export function generateCsrfSecret(): string {
  return generateToken();
}

/**
 * Verify a CSRF token against a secret
 */
export function verifyCsrfToken(secret: string, token: string): boolean {
  return timingSafeEqual(secret, token);
}

/**
 * Get or create CSRF secret from cookies
 */
export function getCsrfSecret(request: NextRequest): string {
  const existingSecret = request.cookies.get(CSRF_SECRET_COOKIE)?.value;
  if (existingSecret && existingSecret.length === 64) { // 32 bytes * 2 hex chars
    return existingSecret;
  }
  return generateCsrfSecret();
}

/**
 * Set CSRF cookie in response
 */
export function setCsrfCookie(response: NextResponse, secret: string): void {
  response.cookies.set(CSRF_SECRET_COOKIE, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

/**
 * Validate CSRF token from request
 * Returns true if valid, false otherwise
 */
export function validateCsrfToken(request: NextRequest): boolean {
  // Get CSRF secret from cookie
  const secret = request.cookies.get(CSRF_SECRET_COOKIE)?.value;
  if (!secret) {
    console.info('CSRF validation failed: No secret cookie');
    return false;
  }

  // Get CSRF token from header
  const token = request.headers.get(CSRF_TOKEN_HEADER);
  if (!token) {
    console.info('CSRF validation failed: No token header');
    return false;
  }

  // Verify token
  const isValid = verifyCsrfToken(secret, token);
  if (!isValid) {
    console.info('CSRF validation failed: Invalid token');
  }

  return isValid;
}

/**
 * Middleware helper to handle CSRF for API routes
 * Call this at the beginning of your API route handlers
 */
export function requireCsrfToken(request: NextRequest): NextResponse | null {
  if (!validateCsrfToken(request)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid or missing CSRF token. Please refresh the page and try again.',
      },
      { status: 403 }
    );
  }
  return null;
}
