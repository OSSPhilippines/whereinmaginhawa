import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { Json } from '@/types/database';

const reviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (admin.response) return admin.response;

    const { id } = await params;
    const supabase = await createClient();

    // Fetch the submission
    const { data: submission, error: fetchError } = await supabase
      .from('place_submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found.' },
        { status: 404 }
      );
    }

    if (submission.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'This submission has already been reviewed.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = reviewSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be "approved" or "rejected".' },
        { status: 400 }
      );
    }

    const { status } = validation.data;
    const now = new Date().toISOString();

    // Update submission status
    const { error: updateError } = await supabase
      .from('place_submissions')
      .update({
        status,
        reviewed_by: admin.profile.id,
        reviewed_at: now,
        updated_at: now,
      })
      .eq('id', id);

    if (updateError) {
      console.info('[admin/submissions] Update error:', updateError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to update submission.' },
        { status: 500 }
      );
    }

    // If approved, create the place from place_data
    if (status === 'approved') {
      const placeData = submission.place_data as Record<string, unknown>;

      const { error: insertError } = await supabase
        .from('places')
        .insert({
          name: placeData.name as string,
          slug: placeData.slug as string,
          description: placeData.description as string,
          address: placeData.address as string,
          phone: (placeData.phone as string) || null,
          email: (placeData.email as string) || null,
          website: (placeData.website as string) || null,
          logo_url: (placeData.logo_url as string) || null,
          cover_image_url: (placeData.cover_image_url as string) || null,
          photos_urls: (placeData.photos_urls as string[]) || null,
          operating_hours: (placeData.operating_hours ?? {}) as unknown as Json,
          price_range: (placeData.price_range as string) || '$',
          payment_methods: (placeData.payment_methods as string[]) || null,
          tags: (placeData.tags as string[]) || null,
          amenities: (placeData.amenities as string[]) || null,
          cuisine_types: (placeData.cuisine_types as string[]) || null,
          specialties: (placeData.specialties as string[]) || null,
          latitude: (placeData.latitude as number) || null,
          longitude: (placeData.longitude as number) || null,
          created_by: submission.submitted_by_user_id,
          created_at: now,
          updated_at: now,
        });

      if (insertError) {
        console.info('[admin/submissions] Place insert error:', insertError.message);
        return NextResponse.json(
          { success: false, error: 'Submission approved but failed to create place: ' + insertError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Submission ${status} successfully.`,
    });
  } catch (error) {
    console.info('[admin/submissions] API error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
