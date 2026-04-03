/**
 * Place Types
 * These types mirror the Supabase database schema for easy migration in Phase 2
 */

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface OperatingHours {
  [key: string]:
    | {
        closed: any;  // Accepts any truthy value (true, 1, "yes", etc.)
        open?: string;
        close?: string;
      }
    | {
        open: string;   // Format: "HH:MM" (24-hour)
        close: string;  // Format: "HH:MM" (24-hour)
        closed?: false;
      };
}

export type PriceRange = '$' | '$$' | '$$$' | '$$$$';

export type PaymentMethod = 'cash' | 'gcash' | 'paymaya' | 'credit-card' | 'debit-card' | 'bank-transfer';

export type TagCategory = 'amenity' | 'cuisine' | 'dietary' | 'atmosphere' | 'service';

export interface Tag {
  id: string;
  name: string;
  slug: string;
  category: TagCategory;
}

export interface Contributor {
  name: string;           // Display name or nickname (required)
  email?: string;         // Optional email
  github?: string;        // Optional social media handle
  contributedAt: string;  // ISO 8601 timestamp
  action: 'created' | 'updated' | 'verified';  // Type of contribution
}

/**
 * PlaceIndex - Lightweight type for list views and search
 * Contains only essential fields needed for browsing and filtering
 * Used in places.json (index file)
 */
export interface PlaceIndex {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  logoUrl?: string;
  coverImageUrl?: string;
  priceRange: PriceRange;

  // Categorization & Search
  tags: string[];
  amenities: string[];
  cuisineTypes: string[];
  specialties: string[];

  // Metadata
  updatedAt: string;
  createdBy?: string;  // Display name of original creator
  verified?: boolean;
  claimedBy?: string;
}

/**
 * Place - Complete place data
 * Contains all fields including contact info, operating hours, etc.
 * Used in individual place files (places/[slug].json)
 */
export interface Place {
  id: string;
  name: string;
  slug: string;
  description: string;

  // Contact Information
  address: string;
  phone?: string;
  email?: string;
  website?: string;

  // Media
  logoUrl?: string;
  coverImageUrl?: string;
  photosUrls: string[];

  // Business Details
  operatingHours: OperatingHours;
  priceRange: PriceRange;
  paymentMethods: PaymentMethod[];

  // Categorization & Search
  tags: string[];              // Tag slugs for easy searching
  amenities: string[];         // e.g., "pet-friendly", "wifi", "parking"
  cuisineTypes: string[];      // e.g., "filipino", "japanese", "italian"
  specialties: string[];       // e.g., "sisig", "ramen", "pizza"

  // Location (for Phase 2 map integration)
  latitude?: number;
  longitude?: number;

  // Metadata
  createdAt: string;
  updatedAt: string;

  // Contributor Information
  createdBy?: string;              // Display name of original creator
  contributors?: Contributor[];    // History of all contributors

  // Optional future fields
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
  claimedBy?: string;
}

/**
 * Supabase Database Schema (for Phase 2)
 *
 * -- places table
 * CREATE TABLE places (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   name TEXT NOT NULL,
 *   slug TEXT UNIQUE NOT NULL,
 *   description TEXT NOT NULL,
 *   address TEXT NOT NULL,
 *   phone TEXT,
 *   email TEXT,
 *   website TEXT,
 *   logo_url TEXT,
 *   cover_image_url TEXT,
 *   photos_urls TEXT[],
 *   operating_hours JSONB NOT NULL,
 *   price_range TEXT NOT NULL CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),
 *   payment_methods TEXT[],
 *   tags TEXT[],
 *   amenities TEXT[],
 *   cuisine_types TEXT[],
 *   specialties TEXT[],
 *   latitude DECIMAL(10, 8),
 *   longitude DECIMAL(11, 8),
 *   rating DECIMAL(2, 1),
 *   review_count INTEGER DEFAULT 0,
 *   verified BOOLEAN DEFAULT false,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 *
 * -- tags table (normalized for better querying)
 * CREATE TABLE tags (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   name TEXT NOT NULL,
 *   slug TEXT UNIQUE NOT NULL,
 *   category TEXT NOT NULL CHECK (category IN ('amenity', 'cuisine', 'dietary', 'atmosphere', 'service')),
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 *
 * -- place_tags junction table
 * CREATE TABLE place_tags (
 *   place_id UUID REFERENCES places(id) ON DELETE CASCADE,
 *   tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
 *   PRIMARY KEY (place_id, tag_id)
 * );
 *
 * -- Indexes for better search performance
 * CREATE INDEX idx_places_slug ON places(slug);
 * CREATE INDEX idx_places_tags ON places USING GIN(tags);
 * CREATE INDEX idx_places_amenities ON places USING GIN(amenities);
 * CREATE INDEX idx_places_cuisine ON places USING GIN(cuisine_types);
 * CREATE INDEX idx_places_location ON places USING GIST(ll_to_earth(latitude, longitude));
 *
 * -- Full-text search index
 * ALTER TABLE places ADD COLUMN search_vector tsvector;
 * CREATE INDEX idx_places_search ON places USING GIN(search_vector);
 * CREATE TRIGGER places_search_update
 *   BEFORE INSERT OR UPDATE ON places
 *   FOR EACH ROW EXECUTE FUNCTION
 *   tsvector_update_trigger(search_vector, 'pg_catalog.english', name, description, specialties);
 */

// Search and filter types
export interface SearchFilters {
  query?: string;
  keywords?: string[]; // Search across tags, amenities, cuisineTypes, and specialties
  tags?: string[];
  amenities?: string[];
  cuisineTypes?: string[];
  priceRanges?: PriceRange[];
  openNow?: boolean;
  favoritesOnly?: boolean;
}

export interface SearchResult {
  places: PlaceIndex[];  // Use PlaceIndex for list views (lighter payload)
  total: number;
  filters: SearchFilters;
}
