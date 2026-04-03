import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireCsrfToken } from '@/lib/csrf';

const claimSchema = z.object({
  place_id: z.string().uuid(),
  claimant_name: z.string().min(1).max(200),
  claimant_phone: z.string().max(50).optional().nullable(),
  claimant_role: z.enum(['owner', 'manager', 'representative']),
  proof_text: z.string().max(2000).optional().nullable(),
  proof_documents: z.array(z.string().url()).max(10).optional(),
});

export async function POST(request: NextRequest) {
  // CSRF check
  const csrfError = requireCsrfToken(request);
  if (csrfError) return csrfError;

  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const validation = claimSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: 'Validation failed', details: validation.error.format() },
      { status: 400 }
    );
  }

  const { place_id, claimant_name, claimant_phone, claimant_role, proof_text, proof_documents } = validation.data;

  // Check place exists
  const { data: place, error: placeError } = await supabase
    .from('places')
    .select('id, claimed_by')
    .eq('id', place_id)
    .single();

  if (placeError || !place) {
    return NextResponse.json({ success: false, error: 'Place not found' }, { status: 404 });
  }

  if (place.claimed_by) {
    return NextResponse.json({ success: false, error: 'This place has already been claimed' }, { status: 409 });
  }

  // Check for existing pending claim
  const { data: existingClaim } = await supabase
    .from('business_claims')
    .select('id')
    .eq('place_id', place_id)
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .single();

  if (existingClaim) {
    return NextResponse.json({ success: false, error: 'You already have a pending claim for this place' }, { status: 409 });
  }

  const { data: claim, error: insertError } = await supabase
    .from('business_claims')
    .insert({
      place_id,
      user_id: user.id,
      claimant_name,
      claimant_phone: claimant_phone || null,
      claimant_role,
      proof_text: proof_text || null,
      proof_documents: proof_documents || [],
      status: 'pending',
    })
    .select('id')
    .single();

  if (insertError) {
    console.info('[claims] Insert error:', insertError.message);
    return NextResponse.json({ success: false, error: 'Failed to create claim' }, { status: 500 });
  }

  return NextResponse.json({ success: true, claimId: claim.id }, { status: 201 });
}

export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }

  const { data: claims, error } = await supabase
    .from('business_claims')
    .select('*, places(name, slug)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.info('[claims] Fetch error:', error.message);
    return NextResponse.json({ success: false, error: 'Failed to fetch claims' }, { status: 500 });
  }

  return NextResponse.json({ success: true, claims });
}
