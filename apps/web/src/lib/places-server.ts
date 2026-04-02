import { unstable_cache } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { dbRowToPlace, dbRowToPlaceIndex } from '@/lib/supabase/mappers';
import type { Place, PlaceIndex } from '@/types/place';

/**
 * Get all places (index data only) from Supabase - server-side with caching
 * Uses admin client (no cookies) so it can be used inside unstable_cache
 */
export const getAllPlaces = unstable_cache(
  async (): Promise<PlaceIndex[]> => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .order('name');

    if (error) {
      console.info('[places-server] Error fetching places:', error.message);
      return [];
    }

    return (data ?? []).map(dbRowToPlaceIndex);
  },
  ['all-places'],
  { revalidate: 60, tags: ['places'] }
);

/**
 * Get a single place by slug (full data) - server-side
 */
export async function getPlaceBySlug(slug: string): Promise<Place | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    console.info(`[places-server] Failed to load place: ${slug}`, error?.message);
    return undefined;
  }

  const place = dbRowToPlace(data);

  // Fetch contributors
  const { data: contributors } = await supabase
    .from('contributors')
    .select('*')
    .eq('place_id', data.id)
    .order('contributed_at', { ascending: false });

  if (contributors && contributors.length > 0) {
    place.contributors = contributors.map((c) => ({
      name: c.name,
      email: c.email ?? undefined,
      github: c.github ?? undefined,
      contributedAt: c.contributed_at,
      action: c.action,
    }));
  }

  return place;
}

/**
 * Get place by ID (full data) - server-side
 */
export async function getPlaceById(id: string): Promise<Place | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.info(`[places-server] Failed to load place by id: ${id}`, error?.message);
    return undefined;
  }

  const place = dbRowToPlace(data);

  // Fetch contributors
  const { data: contributors } = await supabase
    .from('contributors')
    .select('*')
    .eq('place_id', data.id)
    .order('contributed_at', { ascending: false });

  if (contributors && contributors.length > 0) {
    place.contributors = contributors.map((c) => ({
      name: c.name,
      email: c.email ?? undefined,
      github: c.github ?? undefined,
      contributedAt: c.contributed_at,
      action: c.action,
    }));
  }

  return place;
}
