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

const suggestionSchema = z.object({
  // Place identity
  placeId: z.string().uuid('Valid place UUID required'),

  // Editable fields
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
 * Compute field-by-field diff between the existing place and submitted data.
 * Only includes fields that actually changed.
 */
function computeDiff(
  existing: Record<string, unknown>,
  submitted: Record<string, unknown>
): Record<string, { old: unknown; new: unknown }> {
  const diff: Record<string, { old: unknown; new: unknown }> = {};
  const fieldsToCompare = [
    'name', 'description', 'address', 'phone', 'email', 'website',
    'logo_url', 'cover_image_url', 'operating_hours', 'price_range',
    'cuisine_types', 'specialties', 'tags', 'amenities', 'payment_methods',
    'latitude', 'longitude',
  ];

  for (const field of fieldsToCompare) {
    const oldVal = existing[field];
    const newVal = submitted[field];

    // Normalize nulls/undefined/empty strings for comparison
    const normalizedOld = oldVal === null || oldVal === undefined || oldVal === '' ? null : oldVal;
    const normalizedNew = newVal === null || newVal === undefined || newVal === '' ? null : newVal;

    if (JSON.stringify(normalizedOld) !== JSON.stringify(normalizedNew)) {
      diff[field] = { old: normalizedOld, new: normalizedNew };
    }
  }

  return diff;
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
    const validation = suggestionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;
    const admin = createAdminClient();

    // Fetch the existing place to compute diff
    const { data: existingPlace, error: fetchError } = await admin
      .from('places')
      .select('*')
      .eq('id', data.placeId)
      .single();

    if (fetchError || !existingPlace) {
      return NextResponse.json(
        { success: false, error: 'Place not found.' },
        { status: 404 }
      );
    }

    // Build submitted data in DB column format for comparison
    const submittedDbFormat: Record<string, unknown> = {
      name: data.name,
      description: data.description,
      address: data.address,
      phone: data.phone || null,
      email: data.email || null,
      website: data.website || null,
      logo_url: data.logoUrl || null,
      cover_image_url: data.coverImageUrl || null,
      operating_hours: data.operatingHours,
      price_range: data.priceRange,
      cuisine_types: data.cuisineTypes,
      specialties: data.specialties,
      tags: data.tags,
      amenities: data.amenities,
      payment_methods: data.paymentMethods,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
    };

    const changes = computeDiff(existingPlace as Record<string, unknown>, submittedDbFormat);

    if (Object.keys(changes).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No changes detected. The submitted data is identical to the current listing.' },
        { status: 400 }
      );
    }

    // Check if logged-in user (optional)
    let userId: string | null = null;
    try {
      const user = await getSession();
      if (user) userId = user.id;
    } catch {
      // Anonymous submission is fine
    }

    // Insert suggestion using admin client (bypasses RLS for anonymous users)
    const { data: suggestion, error: insertError } = await admin
      .from('update_suggestions')
      .insert({
        place_id: data.placeId,
        suggested_by_user_id: userId,
        suggested_by_name: data.contributorName,
        suggested_by_email: data.contributorEmail || null,
        changes: changes as unknown as Json,
      })
      .select('id')
      .single();

    if (insertError) {
      console.info('[suggestions] Insert error:', insertError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to submit your suggestion. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      suggestionId: suggestion.id,
      changedFields: Object.keys(changes),
      message: 'Your suggested changes have been submitted for review.',
    });
  } catch (error) {
    console.info('[suggestions] API error:', error);

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
