import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createPlacePR } from '@/lib/github';
import { requireCsrfToken } from '@/lib/csrf';
import { checkRateLimit } from '@/lib/rate-limiter';
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

// Request body schema (omits auto-generated fields)
const createPlaceRequestSchema = z.object({
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

  // Contributor information (optional)
  contributorName: z.string().optional(),
  contributorEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
  contributorGithub: z.string().optional(),
});

/**
 * Generate a URL-friendly slug from a name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Route segment config - set body size limit
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max execution time
export const dynamic = 'force-dynamic';

// Note: Next.js App Router handles body parsing automatically with a 1MB default limit
// For larger limits, use edge config or streaming APIs

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
    const validation = createPlaceRequestSchema.safeParse(body);

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

    // Generate UUID and slug
    const id = uuidv4();
    const slug = generateSlug(data.name);

    // Create timestamps
    const now = new Date().toISOString();

    // Build Place object
    const place: Place = {
      id,
      name: data.name,
      slug,
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
      createdAt: now,
      updatedAt: now,
    };

    // Create GitHub PR
    const result = await createPlacePR({
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
          error: result.error || 'Failed to submit your place. Please try again.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      prUrl: result.prUrl,
      prNumber: result.prNumber,
      message: `Submission successful! Your place will be reviewed shortly.`,
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
