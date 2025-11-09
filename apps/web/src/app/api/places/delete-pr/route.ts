import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { deletePlacePR } from '@/lib/github';
import { requireCsrfToken } from '@/lib/csrf';
import { checkRateLimit } from '@/lib/rate-limiter';

// Request body schema for place deletion
const deletePlaceRequestSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  name: z.string().min(1, 'Name is required'),
  reason: z.string().optional(),
  contributorName: z.string().optional(),
  contributorEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
});

// Route segment config - set body size limit
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max execution time
export const dynamic = 'force-dynamic';

/**
 * Get client IP address for rate limiting
 */
function getClientIP(request: NextRequest): string {
  // Check various headers for IP address (reverse proxy support)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback to a default identifier
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    // Validate CSRF token
    const csrfError = requireCsrfToken(request);
    if (csrfError) {
      return csrfError;
    }

    // Get client IP for rate limiting
    const clientIP = getClientIP(request);

    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please try again later. (Maximum 5 submissions per hour)',
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = deletePlaceRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Create GitHub PR for deletion
    const result = await deletePlacePR({
      slug: data.slug,
      name: data.name,
      reason: data.reason,
      contributorName: data.contributorName,
      contributorEmail: data.contributorEmail,
    });

    if (!result.success) {
      console.error('PR creation failed:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to submit closure report. Please try again.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      prUrl: result.prUrl,
      prNumber: result.prNumber,
      message: `Closure report submitted successfully! We'll review it shortly.`,
    });
  } catch (error) {
    console.error('API error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}
