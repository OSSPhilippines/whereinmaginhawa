import { NextResponse } from 'next/server';

/**
 * CSRF token endpoint
 * Returns a 200 response - the actual token is set by middleware in the header
 */
export async function GET() {
  return NextResponse.json(
    { success: true },
    { status: 200 }
  );
}
