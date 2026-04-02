import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireCsrfToken } from '@/lib/csrf';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getSession } from '@/lib/auth';
import type { Json } from '@/types/database';

const operatingHoursSchema = z.record(
  z.string(),
  z.object({
    open: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format').optional(),
    close: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format').optional(),
    closed: z.boolean().optional(),
  })
);

const submitPlaceSchema = z.object({
  // Required fields
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  address: z.string().min(1, 'Address is required'),
  operatingHours: operatingHoursSchema,
  priceRange: z.enum(['$', '$$', '$$$', '$$$$'], {
    message: 'Price range must be $, $$, $$$, or $$$$',
  }),
  cuisineTypes: z.array(z.string()).min(1, 'At least one cuisine type is required'),

  // Optional fields
  phone: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  website: z.string().url('Invalid URL format').optional().or(z.literal('')),
  logoUrl: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  coverImageUrl: z.string().url('Invalid cover image URL').optional().or(z.literal('')),
  photosUrls: z.array(z.string().url('Invalid photo URL')).default([]),
  paymentMethods: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  specialties: z.array(z.string()).default([]),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),

  // Contributor info
  contributorName: z.string().min(1, 'Contributor name is required'),
  contributorEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
  contributorGithub: z.string().optional(),
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

/**
 * Generate a URL-friendly slug from a name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(request: NextRequest) {
  try {
    // Validate CSRF token
    const csrfError = requireCsrfToken(request);
    if (csrfError) return csrfError;

    // Rate limit
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please try again later. (Maximum 20 submissions per hour)' },
        { status: 429 }
      );
    }

    // Parse and validate
    const body = await request.json();
    const validation = submitPlaceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;
    const slug = generateSlug(data.name);

    // Build the full place data as JSONB
    const placeData = {
      name: data.name,
      slug,
      description: data.description,
      address: data.address,
      phone: data.phone || null,
      email: data.email || null,
      website: data.website || null,
      logo_url: data.logoUrl || null,
      cover_image_url: data.coverImageUrl || null,
      photos_urls: data.photosUrls,
      operating_hours: data.operatingHours,
      price_range: data.priceRange,
      payment_methods: data.paymentMethods,
      tags: data.tags,
      amenities: data.amenities,
      cuisine_types: data.cuisineTypes,
      specialties: data.specialties,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      contributor_name: data.contributorName,
      contributor_email: data.contributorEmail || null,
      contributor_github: data.contributorGithub || null,
    };

    // Check if logged-in user (optional)
    let userId: string | null = null;
    try {
      const user = await getSession();
      if (user) userId = user.id;
    } catch {
      // Anonymous submission is fine
    }

    const admin = createAdminClient();

    // Insert into place_submissions using admin client (bypasses RLS for anonymous users)
    const { data: submission, error: insertError } = await admin
      .from('place_submissions')
      .insert({
        submitted_by_user_id: userId,
        submitted_by_name: data.contributorName,
        submitted_by_email: data.contributorEmail || null,
        place_data: placeData as unknown as Json,
      })
      .select('id')
      .single();

    if (insertError) {
      console.info('[submit] Insert error:', insertError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to submit your place. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      message: 'Submission successful! Your place will be reviewed shortly.',
    });
  } catch (error) {
    console.info('[submit] API error:', error);

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
