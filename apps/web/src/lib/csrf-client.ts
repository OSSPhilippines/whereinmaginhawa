'use client';

/**
 * Client-side CSRF token utilities
 * Use these functions when making POST requests from the browser
 */

let csrfToken: string | null = null;

/**
 * Fetch the CSRF token from the server
 * This will trigger middleware to set the token
 */
export async function fetchCsrfToken(): Promise<string> {
  try {
    // Make a simple GET request to trigger middleware
    const response = await fetch('/api/csrf', {
      method: 'GET',
      credentials: 'same-origin',
    });

    // Get token from response header
    const token = response.headers.get('x-csrf-token');

    if (!token) {
      throw new Error('CSRF token not found in response');
    }

    // Cache the token
    csrfToken = token;
    return token;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    throw error;
  }
}

/**
 * Get the cached CSRF token or fetch a new one
 */
export async function getCsrfToken(): Promise<string> {
  if (csrfToken) {
    return csrfToken;
  }
  return fetchCsrfToken();
}

/**
 * Make a CSRF-protected POST request
 * Automatically includes CSRF token in headers
 */
export async function csrfFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getCsrfToken();

  return fetch(url, {
    ...options,
    method: options.method || 'POST',
    credentials: 'same-origin',
    headers: {
      ...options.headers,
      'x-csrf-token': token,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Reset the cached CSRF token
 * Call this if you get a 403 CSRF error and need to retry
 */
export function resetCsrfToken(): void {
  csrfToken = null;
}
