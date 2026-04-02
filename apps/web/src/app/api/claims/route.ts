import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Check auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  const body = await request.json();
  const {
    place_id,
    claimant_name,
    claimant_phone,
    claimant_role,
    proof_text,
    proof_documents,
  } = body;

  if (!place_id || !claimant_name || !claimant_role) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields' },
      { status: 400 }
    );
  }

  // Check place exists
  const { data: place, error: placeError } = await supabase
    .from('places')
    .select('id, claimed_by')
    .eq('id', place_id)
    .single();

  if (placeError || !place) {
    return NextResponse.json(
      { success: false, error: 'Place not found' },
      { status: 404 }
    );
  }

  // Check if already claimed
  if (place.claimed_by) {
    return NextResponse.json(
      { success: false, error: 'This place has already been claimed' },
      { status: 409 }
    );
  }

  // Check for existing pending claim by this user
  const { data: existingClaim } = await supabase
    .from('business_claims')
    .select('id')
    .eq('place_id', place_id)
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .single();

  if (existingClaim) {
    return NextResponse.json(
      { success: false, error: 'You already have a pending claim for this place' },
      { status: 409 }
    );
  }

  // Insert claim
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
    console.info('Claim insert error:', insertError);
    return NextResponse.json(
      { success: false, error: 'Failed to create claim' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, claimId: claim.id }, { status: 201 });
}

export async function GET() {
  const supabase = await createClient();

  // Check auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Get user's claims with place info
  const { data: claims, error } = await supabase
    .from('business_claims')
    .select('*, places(name, slug)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.info('Claims fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch claims' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, claims });
}
