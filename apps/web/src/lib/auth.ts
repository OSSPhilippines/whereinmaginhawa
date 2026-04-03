import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export type UserRole = 'user' | 'business_owner' | 'admin';

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

/**
 * Get the current Supabase session from cookies (server-side)
 */
export async function getSession() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Get the current user's profile with role from the profiles table
 */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !data) return null;
  return data as Profile;
}

/**
 * Require authentication for API routes.
 * Returns a 401 response if not authenticated, or null if valid.
 */
export async function requireAuth(
  _request: NextRequest
): Promise<{ user: { id: string; email: string }; response: null } | { user: null; response: NextResponse }> {
  const user = await getSession();
  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }
  return {
    user: { id: user.id, email: user.email! },
    response: null,
  };
}

/**
 * Require admin role for API routes.
 * Returns a 403 response if not admin, or null if valid.
 */
export async function requireAdmin(
  _request: NextRequest
): Promise<{ profile: Profile; response: null } | { profile: null; response: NextResponse }> {
  const profile = await getProfile();
  if (!profile) {
    return {
      profile: null,
      response: NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }
  if (profile.role !== 'admin') {
    return {
      profile: null,
      response: NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      ),
    };
  }
  return { profile, response: null };
}

/**
 * Check if a user is the owner of a place (claimed_by matches userId)
 */
export async function isOwnerOfPlace(userId: string, placeId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('places')
    .select('claimed_by')
    .eq('id', placeId)
    .single();

  if (error || !data) return false;
  return data.claimed_by === userId;
}
