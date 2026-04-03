import Fuse, { type IFuseOptions } from 'fuse.js';
import { createClient } from '@/lib/supabase/client';
import { dbRowToPlace, dbRowToPlaceIndex } from '@/lib/supabase/mappers';
import type { Place, PlaceIndex, SearchFilters, SearchResult } from '@/types/place';

/**
 * Client-side cache for PlaceIndex data
 */
let cachedPlaces: PlaceIndex[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60_000; // 60 seconds

/**
 * Get all places (index data only) from Supabase
 * Uses client-side caching with 60s TTL
 */
export async function getAllPlaces(): Promise<PlaceIndex[]> {
  const now = Date.now();
  if (cachedPlaces && now - cacheTimestamp < CACHE_TTL) {
    return cachedPlaces;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .order('name');

  if (error) {
    console.info('[places] Error fetching places:', error.message);
    return cachedPlaces ?? [];
  }

  cachedPlaces = (data ?? []).map(dbRowToPlaceIndex);
  cacheTimestamp = now;
  return cachedPlaces;
}

/**
 * Get a single place by slug (full data) - client-side
 */
export async function getPlaceBySlug(slug: string): Promise<Place | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return undefined;
  return dbRowToPlace(data);
}

/**
 * Fuse.js configuration for fuzzy search
 */
const fuseOptions: IFuseOptions<PlaceIndex> = {
  keys: [
    { name: 'name', weight: 2 },
    { name: 'description', weight: 1 },
    { name: 'cuisineTypes', weight: 1.5 },
    { name: 'specialties', weight: 1.5 },
    { name: 'tags', weight: 1.2 },
    { name: 'amenities', weight: 1 },
  ],
  threshold: 0.4,
  includeScore: true,
  useExtendedSearch: true,
};

/**
 * Search places with advanced filtering
 * Uses Fuse.js for fuzzy text search on Supabase-sourced data
 */
export async function searchPlaces(filters: SearchFilters): Promise<SearchResult> {
  let results = await getAllPlaces();

  // Text search using Fuse.js
  if (filters.query && filters.query.trim() !== '') {
    const fuse = new Fuse(results, fuseOptions);
    const searchResults = fuse.search(filters.query);
    results = searchResults.map((result) => result.item);
  }

  // Filter by keywords (searches across tags, amenities, cuisineTypes, and specialties)
  if (filters.keywords && filters.keywords.length > 0) {
    results = results.filter((place) =>
      filters.keywords!.some((keyword) =>
        place.tags.includes(keyword) ||
        place.amenities.includes(keyword) ||
        place.cuisineTypes.includes(keyword) ||
        place.specialties.includes(keyword)
      )
    );
  }

  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    results = results.filter((place) =>
      filters.tags!.some((tag) => place.tags.includes(tag))
    );
  }

  // Filter by amenities
  if (filters.amenities && filters.amenities.length > 0) {
    results = results.filter((place) =>
      filters.amenities!.every((amenity) => place.amenities.includes(amenity))
    );
  }

  // Filter by cuisine types
  if (filters.cuisineTypes && filters.cuisineTypes.length > 0) {
    results = results.filter((place) =>
      filters.cuisineTypes!.some((cuisine) =>
        place.cuisineTypes.includes(cuisine)
      )
    );
  }

  // Filter by price range
  if (filters.priceRanges && filters.priceRanges.length > 0) {
    results = results.filter((place) =>
      filters.priceRanges!.includes(place.priceRange)
    );
  }

  // Filter by favorites
  if (filters.favoritesOnly) {
    const FAVORITES_KEY = 'whereinmaginhawa_favorites';
    const stored = typeof window !== 'undefined' ? localStorage.getItem(FAVORITES_KEY) : null;
    const favorites: string[] = stored ? JSON.parse(stored) : [];
    results = results.filter((place) => favorites.includes(place.id));
  }

  return {
    places: results,
    total: results.length,
    filters,
  };
}

/**
 * Get all unique tags from all places
 */
export async function getAllTags(): Promise<string[]> {
  const tags = new Set<string>();
  const places = await getAllPlaces();
  places.forEach((place) => {
    place.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
}

/**
 * Get all unique amenities from all places
 */
export async function getAllAmenities(): Promise<string[]> {
  const amenities = new Set<string>();
  const places = await getAllPlaces();
  places.forEach((place) => {
    place.amenities.forEach((amenity) => amenities.add(amenity));
  });
  return Array.from(amenities).sort();
}

/**
 * Get all unique cuisine types from all places
 */
export async function getAllCuisineTypes(): Promise<string[]> {
  const cuisines = new Set<string>();
  const places = await getAllPlaces();
  places.forEach((place) => {
    place.cuisineTypes.forEach((cuisine) => cuisines.add(cuisine));
  });
  return Array.from(cuisines).sort();
}

/**
 * Get autocomplete suggestions based on query
 * Uses Fuse.js for fuzzy matching on Supabase-sourced data
 */
export async function getAutocompleteSuggestions(query: string): Promise<{
  places: PlaceIndex[];
  tags: string[];
  amenities: string[];
  cuisines: string[];
}> {
  if (!query || query.trim() === '') {
    return {
      places: [],
      tags: [],
      amenities: [],
      cuisines: [],
    };
  }

  const lowerQuery = query.toLowerCase();
  const allPlaces = await getAllPlaces();

  // Search places
  const fuse = new Fuse(allPlaces, fuseOptions);
  const placeResults = fuse.search(query).slice(0, 5);

  // Filter tags
  const allTags = await getAllTags();
  const matchingTags = allTags
    .filter((tag) => tag.toLowerCase().includes(lowerQuery))
    .slice(0, 5);

  // Filter amenities
  const allAmenities = await getAllAmenities();
  const matchingAmenities = allAmenities
    .filter((amenity) => amenity.toLowerCase().includes(lowerQuery))
    .slice(0, 5);

  // Filter cuisines
  const allCuisines = await getAllCuisineTypes();
  const matchingCuisines = allCuisines
    .filter((cuisine) => cuisine.toLowerCase().includes(lowerQuery))
    .slice(0, 5);

  return {
    places: placeResults.map((r) => r.item),
    tags: matchingTags,
    amenities: matchingAmenities,
    cuisines: matchingCuisines,
  };
}
