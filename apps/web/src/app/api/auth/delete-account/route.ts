import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function DELETE(request: NextRequest) {
  const { user, response } = await requireAuth(request);
  if (!user) return response;

  const admin = createAdminClient();

  // Unclaim any places owned by this user so they become available again
  const { error: unclaimError } = await admin
    .from('places')
    .update({ claimed_by: null, verified: false })
    .eq('claimed_by', user.id);

  if (unclaimError) {
    console.info('[delete-account] Failed to unclaim places:', unclaimError.message);
    return NextResponse.json(
      { success: false, error: 'Failed to release claimed places' },
      { status: 500 }
    );
  }

  // Delete the auth user — profile row cascades via ON DELETE CASCADE,
  // contributors.user_id is SET NULL, business_claims cascade
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    console.info('[delete-account] Failed to delete user:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to delete account' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
