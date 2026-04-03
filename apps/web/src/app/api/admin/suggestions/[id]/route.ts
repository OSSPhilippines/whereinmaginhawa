import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limiter';

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

    if (!(await checkRateLimit(`admin:${admin.profile.id}`, { limit: 100, windowMs: 60 * 60 * 1000 }))) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded.' }, { status: 429 });
    }

    const { id } = await params;
    const supabase = await createClient();

    // Fetch the suggestion
    const { data: suggestion, error: fetchError } = await supabase
      .from('update_suggestions')
      .select('id, place_id, status, changes')
      .eq('id', id)
      .single();

    if (fetchError || !suggestion) {
      return NextResponse.json(
        { success: false, error: 'Suggestion not found.' },
        { status: 404 }
      );
    }

    if (suggestion.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'This suggestion has already been reviewed.' },
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

    // Update suggestion status
    const { error: updateError } = await supabase
      .from('update_suggestions')
      .update({
        status,
        reviewed_by: admin.profile.id,
        reviewed_at: now,
        updated_at: now,
      })
      .eq('id', id);

    if (updateError) {
      console.info('[admin/suggestions] Update error:', updateError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to update suggestion.' },
        { status: 500 }
      );
    }

    // If approved, apply the changes to the place
    if (status === 'approved') {
      const changes = suggestion.changes as Record<string, { new: unknown }>;
      const placeUpdate: Record<string, unknown> = { updated_at: now };

      for (const [field, value] of Object.entries(changes)) {
        if (field.startsWith('_')) continue; // Skip meta fields like _type
        if (value && typeof value === 'object' && 'new' in value) {
          placeUpdate[field] = value.new;
        }
      }

      if (Object.keys(placeUpdate).length > 1) {
        const { error: placeError } = await supabase
          .from('places')
          .update(placeUpdate)
          .eq('id', suggestion.place_id);

        if (placeError) {
          console.info('[admin/suggestions] Place update error:', placeError.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Suggestion ${status} successfully.`,
    });
  } catch (error) {
    console.info('[admin/suggestions] API error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
