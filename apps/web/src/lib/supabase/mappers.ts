import type { Place, PlaceIndex, OperatingHours, PriceRange, PaymentMethod } from '@/types/place';
import type { Database } from '@/types/database';

type PlaceRow = Database['public']['Tables']['places']['Row'];
type PlaceInsert = Database['public']['Tables']['places']['Insert'];

/**
 * Maps a Supabase DB row (snake_case) to a Place object (camelCase)
 */
export function dbRowToPlace(row: PlaceRow): Place {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    address: row.address,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    website: row.website ?? undefined,
    logoUrl: row.logo_url ?? undefined,
    coverImageUrl: row.cover_image_url ?? undefined,
    photosUrls: row.photos_urls ?? [],
    operatingHours: row.operating_hours as OperatingHours,
    priceRange: row.price_range as PriceRange,
    paymentMethods: (row.payment_methods ?? []) as PaymentMethod[],
    tags: row.tags ?? [],
    amenities: row.amenities ?? [],
    cuisineTypes: row.cuisine_types ?? [],
    specialties: row.specialties ?? [],
    latitude: row.latitude ? Number(row.latitude) : undefined,
    longitude: row.longitude ? Number(row.longitude) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by ?? undefined,
    rating: row.rating ? Number(row.rating) : undefined,
    reviewCount: row.review_count ?? undefined,
    verified: row.verified ?? undefined,
    claimedBy: row.claimed_by ?? undefined,
  };
}

/**
 * Maps a Supabase DB row to a lightweight PlaceIndex for list views/search
 */
export function dbRowToPlaceIndex(row: PlaceRow): PlaceIndex {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    address: row.address,
    logoUrl: row.logo_url ?? undefined,
    coverImageUrl: row.cover_image_url ?? undefined,
    priceRange: row.price_range as PriceRange,
    tags: row.tags ?? [],
    amenities: row.amenities ?? [],
    cuisineTypes: row.cuisine_types ?? [],
    specialties: row.specialties ?? [],
    updatedAt: row.updated_at,
    createdBy: row.created_by ?? undefined,
    verified: row.verified ?? undefined,
    claimedBy: row.claimed_by ?? undefined,
  };
}

/**
 * Maps a camelCase Place object to snake_case for DB inserts/updates
 */
export function placeToDbRow(place: Place): PlaceInsert {
  return {
    id: place.id,
    name: place.name,
    slug: place.slug,
    description: place.description,
    address: place.address,
    phone: place.phone ?? null,
    email: place.email ?? null,
    website: place.website ?? null,
    logo_url: place.logoUrl ?? null,
    cover_image_url: place.coverImageUrl ?? null,
    photos_urls: place.photosUrls,
    operating_hours: place.operatingHours,
    price_range: place.priceRange,
    payment_methods: place.paymentMethods,
    tags: place.tags,
    amenities: place.amenities,
    cuisine_types: place.cuisineTypes,
    specialties: place.specialties,
    latitude: place.latitude ?? null,
    longitude: place.longitude ?? null,
    created_at: place.createdAt,
    updated_at: place.updatedAt,
    created_by: place.createdBy ?? null,
    rating: place.rating ?? null,
    review_count: place.reviewCount ?? null,
    verified: place.verified ?? null,
    claimed_by: place.claimedBy ?? null,
  };
}
