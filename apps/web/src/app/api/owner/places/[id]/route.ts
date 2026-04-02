import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, isOwnerOfPlace } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

const operatingHoursSchema = z.record(
  z.string(),
  z.object({
    open: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    close: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    closed: z.boolean().optional(),
  })
);

const updatePlaceSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(10).optional(),
  address: z.string().min(1).optional(),
  operatingHours: operatingHoursSchema.optional(),
  priceRange: z.enum(['$', '$$', '$$$', '$$$$']).optional(),
  cuisineTypes: z.array(z.string()).min(1).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal('')),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
  photosUrls: z.array(z.string().url()).optional(),
  paymentMethods: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  specialties: z.array(z.string()).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth.response) return auth.response;

    const { id } = await params;

    // Verify ownership
    const isOwner = await isOwnerOfPlace(auth.user.id, id);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'You do not own this place.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = updatePlaceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;
    const supabase = await createClient();

    // Build update object (only include provided fields)
    const update: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.name !== undefined) update.name = data.name;
    if (data.description !== undefined) update.description = data.description;
    if (data.address !== undefined) update.address = data.address;
    if (data.operatingHours !== undefined) update.operating_hours = data.operatingHours;
    if (data.priceRange !== undefined) update.price_range = data.priceRange;
    if (data.cuisineTypes !== undefined) update.cuisine_types = data.cuisineTypes;
    if (data.phone !== undefined) update.phone = data.phone || null;
    if (data.email !== undefined) update.email = data.email || null;
    if (data.website !== undefined) update.website = data.website || null;
    if (data.logoUrl !== undefined) update.logo_url = data.logoUrl || null;
    if (data.coverImageUrl !== undefined) update.cover_image_url = data.coverImageUrl || null;
    if (data.photosUrls !== undefined) update.photos_urls = data.photosUrls;
    if (data.paymentMethods !== undefined) update.payment_methods = data.paymentMethods;
    if (data.tags !== undefined) update.tags = data.tags;
    if (data.amenities !== undefined) update.amenities = data.amenities;
    if (data.specialties !== undefined) update.specialties = data.specialties;
    if (data.latitude !== undefined) update.latitude = data.latitude;
    if (data.longitude !== undefined) update.longitude = data.longitude;

    const { error: updateError } = await supabase
      .from('places')
      .update(update)
      .eq('id', id);

    if (updateError) {
      console.info('[owner/places] Update error:', updateError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to update place.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Place updated successfully.' });
  } catch (error) {
    console.info('[owner/places] API error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
