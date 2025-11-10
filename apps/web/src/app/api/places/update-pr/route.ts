import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { updatePlacePR } from '@/lib/github';
import { requireCsrfToken } from '@/lib/csrf';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getPlaceBySlug } from '@/lib/places';
import type { Place } from '@/types/place';

// Operating hours schema (matches validation schema)
const operatingHoursSchema = z.record(
  z.string(),
  z.object({
    open: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format').optional(),
    close: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format').optional(),
    closed: z.boolean().optional(),
  })
);

// Request body schema for updating places (includes id and slug)
const updatePlaceRequestSchema = z.object({
  // Identity fields (required for updates)
  id: z.string().uuid('Valid UUID required'),
  slug: z.string().min(1, 'Slug is required'),

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

  // Contributor information
  contributorName: z.string().min(1, 'Contributor name is required'),
  contributorEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
  contributorGithub: z.string().optional(),
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
    const validation = updatePlaceRequestSchema.safeParse(body);

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

    // Fetch existing place to preserve createdBy and createdAt
    const existingPlace = await getPlaceBySlug(data.slug);

    if (!existingPlace) {
      return NextResponse.json(
        {
          success: false,
          error: 'Place not found. Cannot update a non-existent place.',
        },
        { status: 404 }
      );
    }

    // Create timestamps (preserve original createdAt, update updatedAt)
    const now = new Date().toISOString();

    // Build updated contributors array
    const existingContributors = existingPlace.contributors || [];
    const newContributor = {
      name: data.contributorName,
      email: data.contributorEmail || undefined,
      github: data.contributorGithub || undefined,
      contributedAt: now,
      action: 'updated' as const,
    };

    // Add new contributor to the array
    const updatedContributors = [...existingContributors, newContributor];

    // Build Place object, preserving createdBy and createdAt from existing place
    const place: Place = {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      address: data.address,
      phone: data.phone,
      email: data.email || undefined,
      website: data.website || undefined,
      logoUrl: data.logoUrl || undefined,
      coverImageUrl: data.coverImageUrl || undefined,
      photosUrls: data.photosUrls,
      operatingHours: data.operatingHours as any, // Type assertion needed due to Zod schema flexibility
      priceRange: data.priceRange,
      paymentMethods: data.paymentMethods as any, // Will be validated by existing schema
      tags: data.tags,
      amenities: data.amenities,
      cuisineTypes: data.cuisineTypes,
      specialties: data.specialties,
      latitude: data.latitude,
      longitude: data.longitude,
      createdAt: existingPlace.createdAt, // Preserve original creation date
      updatedAt: now,
      createdBy: existingPlace.createdBy || 'Anonymous', // Preserve original creator
      contributors: updatedContributors, // Add new contributor to history
    };

    // Create GitHub PR for update
    const result = await updatePlacePR({
      place,
      contributorName: data.contributorName,
      contributorEmail: data.contributorEmail,
      contributorGithub: data.contributorGithub,
    });

    if (!result.success) {
      console.error('PR creation failed:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to submit your changes. Please try again.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      prUrl: result.prUrl,
      prNumber: result.prNumber,
      message: `Changes submitted successfully! Your updates will be reviewed shortly.`,
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
