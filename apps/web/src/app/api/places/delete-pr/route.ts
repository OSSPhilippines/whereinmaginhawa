import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireCsrfToken } from '@/lib/csrf';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getSession } from '@/lib/auth';
import type { Json } from '@/types/database';

const deletePlaceRequestSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  name: z.string().min(1, 'Name is required'),
  reason: z.string().optional(),
  contributorName: z.string().optional(),
  contributorEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
});

export const runtime = 'nodejs';
export const maxDuration = 30;
export const dynamic = 'force-dynamic';

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP;
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const csrfError = requireCsrfToken(request);
    if (csrfError) return csrfError;

    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = deletePlaceRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;
    const admin = createAdminClient();

    // Look up the place by slug
    const { data: place, error: fetchError } = await admin
      .from('places')
      .select('id')
      .eq('slug', data.slug)
      .single();

    if (fetchError || !place) {
      return NextResponse.json(
        { success: false, error: 'Place not found.' },
        { status: 404 }
      );
    }

    let userId: string | null = null;
    try {
      const user = await getSession();
      if (user) userId = user.id;
    } catch {
      // Anonymous is fine
    }

    // Store as a suggestion with a special closure change marker
    const changes = {
      _type: 'closure_report',
      reason: data.reason || 'Reported as permanently closed',
    };

    const { data: suggestion, error: insertError } = await admin
      .from('update_suggestions')
      .insert({
        place_id: place.id,
        suggested_by_user_id: userId,
        suggested_by_name: data.contributorName || 'Anonymous',
        suggested_by_email: data.contributorEmail || null,
        changes: changes as unknown as Json,
      })
      .select('id')
      .single();

    if (insertError) {
      console.info('[delete-report] Insert error:', insertError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to submit closure report. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      suggestionId: suggestion.id,
      message: "Closure report submitted successfully! We'll review it shortly.",
    });
  } catch (error) {
    console.info('[delete-report] API error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
