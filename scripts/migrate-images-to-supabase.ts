/**
 * Migrate images from Vercel Blob Storage to Supabase Storage
 *
 * This script:
 * 1. Queries all places in Supabase that have Vercel Blob image URLs
 * 2. Downloads each image from Vercel Blob
 * 3. Uploads it to the Supabase 'place-images' bucket
 * 4. Updates the place record with the new Supabase Storage URL
 *
 * Usage:
 *   npx tsx scripts/migrate-images-to-supabase.ts
 *   npx tsx scripts/migrate-images-to-supabase.ts --dry-run
 */

import { config } from 'dotenv';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: join(__dirname, '..', 'apps', 'web', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'place-images';
const VERCEL_BLOB_HOST = 'public.blob.vercel-storage.com';
const CONCURRENCY = 5;
const DRY_RUN = process.argv.includes('--dry-run');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables.');
  console.error('Ensure apps/web/.env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface PlaceRow {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  cover_image_url: string | null;
  photos_urls: string[] | null;
}

function isVercelBlobUrl(url: string | null): url is string {
  return !!url && url.includes(VERCEL_BLOB_HOST);
}

function guessExtension(contentType: string, originalUrl: string): string {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };

  if (mimeMap[contentType]) return mimeMap[contentType];

  // Try to get extension from URL path
  const pathMatch = new URL(originalUrl).pathname.match(/\.(\w+)$/);
  if (pathMatch) return pathMatch[1];

  // Vercel Blob often uses .blob extension — default to webp
  return 'webp';
}

async function downloadImage(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} downloading ${url}`);
  }
  const contentType = response.headers.get('content-type') || 'image/webp';
  const arrayBuffer = await response.arrayBuffer();
  return { buffer: Buffer.from(arrayBuffer), contentType };
}

async function uploadToSupabase(
  buffer: Buffer,
  filePath: string,
  contentType: string
): Promise<string> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Upload failed for ${filePath}: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

async function migrateImage(
  place: PlaceRow,
  field: 'logo_url' | 'cover_image_url',
  type: 'profile' | 'cover'
): Promise<{ field: string; oldUrl: string; newUrl: string } | null> {
  const oldUrl = place[field];
  if (!isVercelBlobUrl(oldUrl)) return null;

  const { buffer, contentType } = await downloadImage(oldUrl);
  const ext = guessExtension(contentType, oldUrl);
  const timestamp = Date.now();
  const filePath = `places/${place.slug}/${type}-${timestamp}.${ext}`;

  const newUrl = await uploadToSupabase(buffer, filePath, contentType);
  return { field, oldUrl, newUrl };
}

async function migratePhotos(
  place: PlaceRow
): Promise<{ field: string; oldUrls: string[]; newUrls: string[] } | null> {
  const photos = place.photos_urls;
  if (!photos || photos.length === 0) return null;

  const vercelPhotos = photos.filter(isVercelBlobUrl);
  if (vercelPhotos.length === 0) return null;

  const newUrls: string[] = [];
  const oldUrls: string[] = [];

  for (let i = 0; i < photos.length; i++) {
    const url = photos[i];
    if (!isVercelBlobUrl(url)) {
      newUrls.push(url); // Keep non-Vercel URLs as-is
      continue;
    }

    oldUrls.push(url);
    const { buffer, contentType } = await downloadImage(url);
    const ext = guessExtension(contentType, url);
    const timestamp = Date.now();
    const filePath = `places/${place.slug}/photo-${i}-${timestamp}.${ext}`;
    const newUrl = await uploadToSupabase(buffer, filePath, contentType);
    newUrls.push(newUrl);
  }

  return { field: 'photos_urls', oldUrls, newUrls };
}

/** Process a batch of items with limited concurrency */
async function processWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  const executing: Promise<void>[] = [];

  for (const item of items) {
    const p = fn(item).then((result) => {
      results.push(result);
    });
    executing.push(p);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      // Remove settled promises
      for (let i = executing.length - 1; i >= 0; i--) {
        const settled = await Promise.race([
          executing[i].then(() => true),
          Promise.resolve(false),
        ]);
        if (settled) executing.splice(i, 1);
      }
    }
  }

  await Promise.all(executing);
  return results;
}

async function migrate() {
  console.info('=== Migrate Images: Vercel Blob -> Supabase Storage ===\n');
  if (DRY_RUN) console.info('  [DRY RUN] No changes will be made.\n');

  // 1. Fetch all places
  const { data: places, error } = await supabase
    .from('places')
    .select('id, slug, name, logo_url, cover_image_url, photos_urls');

  if (error) {
    console.error('Failed to fetch places:', error.message);
    process.exit(1);
  }

  if (!places || places.length === 0) {
    console.info('No places found in database.');
    process.exit(0);
  }

  console.info(`Found ${places.length} places in database.\n`);

  // 2. Filter places that have Vercel Blob URLs
  const placesWithVercelImages = (places as PlaceRow[]).filter(
    (p) =>
      isVercelBlobUrl(p.logo_url) ||
      isVercelBlobUrl(p.cover_image_url) ||
      (p.photos_urls && p.photos_urls.some(isVercelBlobUrl))
  );

  if (placesWithVercelImages.length === 0) {
    console.info('No places have Vercel Blob image URLs. Nothing to migrate.');
    process.exit(0);
  }

  console.info(`${placesWithVercelImages.length} places have Vercel Blob images to migrate.\n`);

  // 3. Ensure bucket exists
  if (!DRY_RUN) {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === BUCKET);
    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      });
      if (createError) {
        console.error(`Failed to create bucket "${BUCKET}":`, createError.message);
        process.exit(1);
      }
      console.info(`Created storage bucket "${BUCKET}".\n`);
    }
  }

  // 4. Process each place
  let success = 0;
  let failed = 0;
  let imagesDownloaded = 0;
  const errors: string[] = [];

  await processWithConcurrency(placesWithVercelImages, CONCURRENCY, async (place) => {
    const placeLabel = `${place.name} (${place.slug})`;

    try {
      const updates: Record<string, string | string[]> = {};
      const migrations: string[] = [];

      // Migrate logo
      const logoResult = await migrateImage(place, 'logo_url', 'profile');
      if (logoResult) {
        updates.logo_url = logoResult.newUrl;
        migrations.push(`logo: ${logoResult.oldUrl} -> ${logoResult.newUrl}`);
        imagesDownloaded++;
      }

      // Migrate cover image
      const coverResult = await migrateImage(place, 'cover_image_url', 'cover');
      if (coverResult) {
        updates.cover_image_url = coverResult.newUrl;
        migrations.push(`cover: ${coverResult.oldUrl} -> ${coverResult.newUrl}`);
        imagesDownloaded++;
      }

      // Migrate photos
      const photosResult = await migratePhotos(place);
      if (photosResult) {
        updates.photos_urls = photosResult.newUrls;
        migrations.push(`photos: ${photosResult.oldUrls.length} images migrated`);
        imagesDownloaded += photosResult.oldUrls.length;
      }

      if (Object.keys(updates).length === 0) {
        return;
      }

      if (DRY_RUN) {
        console.info(`  [DRY RUN] ${placeLabel}`);
        migrations.forEach((m) => console.info(`    ${m}`));
        success++;
        return;
      }

      // Update the place record
      const { error: updateError } = await supabase
        .from('places')
        .update(updates)
        .eq('id', place.id);

      if (updateError) {
        throw new Error(`DB update failed: ${updateError.message}`);
      }

      console.info(`  OK  ${placeLabel}`);
      migrations.forEach((m) => console.info(`      ${m}`));
      success++;
    } catch (err) {
      const msg = `${placeLabel}: ${err instanceof Error ? err.message : err}`;
      errors.push(msg);
      console.error(`  FAIL  ${msg}`);
      failed++;
    }
  });

  // 5. Summary
  console.info('\n=== Summary ===');
  console.info(`  Places processed: ${success + failed}/${placesWithVercelImages.length}`);
  console.info(`  Success: ${success}`);
  console.info(`  Failed: ${failed}`);
  console.info(`  Images downloaded & uploaded: ${imagesDownloaded}`);

  if (DRY_RUN) {
    console.info('\n  [DRY RUN] Run without --dry-run to execute the migration.');
  }

  if (errors.length > 0) {
    console.info('\n=== Errors ===');
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  console.info('\nDone!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
