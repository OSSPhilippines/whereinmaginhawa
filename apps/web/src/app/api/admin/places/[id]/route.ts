import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

const updatePlaceSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(10).optional(),
  address: z.string().min(1).optional(),
  operating_hours: z.record(z.string(), z.unknown()).optional(),
  price_range: z.enum(['$', '$$', '$$$', '$$$$']).optional(),
  cuisine_types: z.array(z.string()).min(1).optional(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal('')).nullable(),
  website: z.string().url().optional().or(z.literal('')).nullable(),
  logo_url: z.string().url().optional().or(z.literal('')).nullable(),
  cover_image_url: z.string().url().optional().or(z.literal('')).nullable(),
  photos_urls: z.array(z.string().url()).optional(),
  payment_methods: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  specialties: z.array(z.string()).optional(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  verified: z.boolean().optional(),
  claimed_by: z.string().uuid().optional().nullable(),
});

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (admin.response) return admin.response;

    const { id } = await params;
    const supabase = await createClient();

    const { data: place, error: fetchError } = await supabase
      .from('places')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !place) {
      return NextResponse.json(
        { success: false, error: 'Place not found.' },
        { status: 404 }
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

    const update: Record<string, unknown> = {
      ...validation.data,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from('places')
      .update(update)
      .eq('id', id);

    if (updateError) {
      console.info('[admin/places] Update error:', updateError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to update place.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Place updated successfully.' });
  } catch (error) {
    console.info('[admin/places] PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (admin.response) return admin.response;

    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from('places')
      .delete()
      .eq('id', id);

    if (error) {
      console.info('[admin/places] Delete error:', error.message);
      return NextResponse.json(
        { success: false, error: 'Failed to delete place.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Place deleted successfully.' });
  } catch (error) {
    console.info('[admin/places] DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
