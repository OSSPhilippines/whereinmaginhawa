import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

// Load .env.local manually since dotenv/config only reads .env
import { config } from 'dotenv';
config({ path: join(__dirname, '..', 'apps', 'web', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables:');
  if (!SUPABASE_URL) console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  if (!SUPABASE_SERVICE_KEY) console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nMake sure apps/web/.env.local contains these variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const PLACES_DIR = join(__dirname, '..', 'apps', 'web', 'src', 'data', 'places');
const BATCH_SIZE = 50;

interface PlaceJson {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  photosUrls?: string[];
  operatingHours: Record<string, unknown>;
  priceRange: string;
  paymentMethods?: string[];
  tags?: string[];
  amenities?: string[];
  cuisineTypes?: string[];
  specialties?: string[];
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  contributors?: Array<{
    name: string;
    email?: string;
    github?: string;
    action: string;
    contributedAt: string;
  }>;
}

function placeJsonToDbRow(place: PlaceJson) {
  return {
    id: place.id,
    name: place.name,
    slug: place.slug,
    description: place.description,
    address: place.address,
    phone: place.phone || null,
    email: place.email || null,
    website: place.website || null,
    logo_url: place.logoUrl || null,
    cover_image_url: place.coverImageUrl || null,
    photos_urls: place.photosUrls || [],
    operating_hours: place.operatingHours,
    price_range: place.priceRange,
    payment_methods: place.paymentMethods || [],
    tags: place.tags || [],
    amenities: place.amenities || [],
    cuisine_types: place.cuisineTypes || [],
    specialties: place.specialties || [],
    latitude: place.latitude || null,
    longitude: place.longitude || null,
    rating: place.rating || null,
    review_count: place.reviewCount || 0,
    verified: place.verified ?? false,
    created_at: place.createdAt,
    updated_at: place.updatedAt,
    created_by: place.createdBy || null,
  };
}

async function migrate() {
  console.info('=== Migrating Places to Supabase ===\n');

  // Read all JSON files
  const files = readdirSync(PLACES_DIR).filter((f) => f.endsWith('.json'));
  console.info(`Found ${files.length} place files\n`);

  const errors: string[] = [];
  const allContributors: Array<{
    place_id: string;
    name: string;
    email: string | null;
    github: string | null;
    action: string;
    contributed_at: string;
  }> = [];
  let migrated = 0;

  // Process in batches
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    const rows = [];

    for (const file of batch) {
      try {
        const filePath = join(PLACES_DIR, file);
        const content = readFileSync(filePath, 'utf-8');
        const place: PlaceJson = JSON.parse(content);
        rows.push(placeJsonToDbRow(place));

        // Collect contributors
        if (place.contributors && place.contributors.length > 0) {
          for (const contrib of place.contributors) {
            allContributors.push({
              place_id: place.id,
              name: contrib.name,
              email: contrib.email || null,
              github: contrib.github || null,
              action: contrib.action,
              contributed_at: contrib.contributedAt,
            });
          }
        }
      } catch (err) {
        const msg = `Error parsing ${file}: ${err instanceof Error ? err.message : err}`;
        errors.push(msg);
        console.error(`  ✗ ${msg}`);
      }
    }

    if (rows.length > 0) {
      const { error } = await supabase.from('places').upsert(rows, { onConflict: 'id' });

      if (error) {
        const msg = `Batch insert error (files ${i + 1}-${i + batch.length}): ${error.message}`;
        errors.push(msg);
        console.error(`  ✗ ${msg}`);
      } else {
        migrated += rows.length;
        console.info(`  ✓ ${migrated}/${files.length} places migrated`);
      }
    }
  }

  // Insert contributors
  if (allContributors.length > 0) {
    console.info(`\nMigrating ${allContributors.length} contributors...`);

    for (let i = 0; i < allContributors.length; i += BATCH_SIZE) {
      const batch = allContributors.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from('contributors').insert(batch);

      if (error) {
        const msg = `Contributors batch insert error: ${error.message}`;
        errors.push(msg);
        console.error(`  ✗ ${msg}`);
      } else {
        console.info(`  ✓ ${Math.min(i + BATCH_SIZE, allContributors.length)}/${allContributors.length} contributors migrated`);
      }
    }
  }

  // Validation
  console.info('\n=== Validation ===');
  const { count, error: countError } = await supabase
    .from('places')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error(`  ✗ Failed to count places: ${countError.message}`);
  } else {
    console.info(`  JSON files: ${files.length}`);
    console.info(`  DB records: ${count}`);
    if (count === files.length) {
      console.info('  ✓ Counts match!');
    } else {
      console.info(`  ⚠ Count mismatch (may include pre-existing records)`);
    }
  }

  // Summary
  console.info('\n=== Summary ===');
  console.info(`  Places migrated: ${migrated}`);
  console.info(`  Contributors migrated: ${allContributors.length}`);
  console.info(`  Errors: ${errors.length}`);

  if (errors.length > 0) {
    console.info('\n=== Errors ===');
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  console.info('\n✓ Migration complete!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
