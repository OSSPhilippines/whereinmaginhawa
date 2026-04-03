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

    // Fetch the claim
    const { data: claim, error: fetchError } = await supabase
      .from('business_claims')
      .select('id, place_id, user_id, status')
      .eq('id', id)
      .single();

    if (fetchError || !claim) {
      return NextResponse.json(
        { success: false, error: 'Claim not found.' },
        { status: 404 }
      );
    }

    if (claim.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'This claim has already been reviewed.' },
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

    // Update claim status
    const { error: updateError } = await supabase
      .from('business_claims')
      .update({
        status,
        reviewed_by: admin.profile.id,
        reviewed_at: now,
        updated_at: now,
      })
      .eq('id', id);

    if (updateError) {
      console.info('[admin/claims] Update error:', updateError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to update claim.' },
        { status: 500 }
      );
    }

    // If approved, set the place's claimed_by and verified status
    if (status === 'approved') {
      const { error: placeError } = await supabase
        .from('places')
        .update({
          claimed_by: claim.user_id,
          verified: true,
          updated_at: now,
        })
        .eq('id', claim.place_id);

      if (placeError) {
        console.info('[admin/claims] Place update error:', placeError.message);
      }

      // Update user role to business_owner
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'business_owner', updated_at: now })
        .eq('id', claim.user_id);

      if (profileError) {
        console.info('[admin/claims] Profile update error:', profileError.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Claim ${status} successfully.`,
    });
  } catch (error) {
    console.info('[admin/claims] API error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
