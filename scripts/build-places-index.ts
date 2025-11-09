#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

/**
 * Build Places Index Script
 *
 * Reads all individual place files from apps/web/src/data/places/*.json
 * Extracts index fields (id, name, slug, description, etc.)
 * Generates places.json index file for fast list/search operations
 *
 * Usage: tsx scripts/build-places-index.ts
 */

type Place = {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  coverImageUrl?: string;
  priceRange: string;
  tags: string[];
  amenities: string[];
  cuisineTypes: string[];
  specialties: string[];
  updatedAt: string;
  [key: string]: any; // Allow additional fields
};

type PlaceIndex = {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  coverImageUrl?: string;
  priceRange: string;
  tags: string[];
  amenities: string[];
  cuisineTypes: string[];
  specialties: string[];
  updatedAt: string;
};

/**
 * Extract index fields from a complete Place object
 */
function extractIndexFields(place: Place): PlaceIndex {
  return {
    id: place.id,
    name: place.name,
    slug: place.slug,
    description: place.description,
    address: place.address,
    coverImageUrl: place.coverImageUrl,
    priceRange: place.priceRange,
    tags: place.tags,
    amenities: place.amenities,
    cuisineTypes: place.cuisineTypes,
    specialties: place.specialties,
    updatedAt: place.updatedAt,
  };
}

/**
 * Build the places index from individual files
 */
function buildPlacesIndex() {
  const rootDir = process.cwd();
  const placesDir = path.join(rootDir, 'apps/web/src/data/places');
  const outputPath = path.join(rootDir, 'apps/web/src/data/places.json');

  console.info('📁 Building places index...\n');
  console.info(`  Source: ${placesDir}`);
  console.info(`  Output: ${outputPath}\n`);

  // Check if places directory exists
  if (!fs.existsSync(placesDir)) {
    console.error(`❌ Places directory not found: ${placesDir}`);
    console.error('   Run the migration script first to create individual place files.');
    process.exit(1);
  }

  // Read all JSON files from places directory
  const files = fs.readdirSync(placesDir)
    .filter(file => file.endsWith('.json') && file !== 'README.md');

  if (files.length === 0) {
    console.error('❌ No place files found in directory');
    process.exit(1);
  }

  console.info(`📄 Found ${files.length} place files\n`);

  // Process each file
  const placeIndexes: PlaceIndex[] = [];
  let successCount = 0;
  let errorCount = 0;

  files.forEach(file => {
    const filePath = path.join(placesDir, file);

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const place: Place = JSON.parse(content);

      // Extract index fields
      const placeIndex = extractIndexFields(place);
      placeIndexes.push(placeIndex);

      successCount++;
      console.info(`  ✅ ${file}`);
    } catch (error) {
      errorCount++;
      console.error(`  ❌ ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  console.info('');

  if (errorCount > 0) {
    console.error(`❌ Failed to process ${errorCount} file(s)`);
    process.exit(1);
  }

  // Sort by name for consistency
  placeIndexes.sort((a, b) => a.name.localeCompare(b.name));

  // Write to output file
  const output = JSON.stringify(placeIndexes, null, 2);
  fs.writeFileSync(outputPath, output, 'utf-8');

  // Calculate file sizes
  const outputSizeKB = (output.length / 1024).toFixed(2);

  console.info('✨ Index built successfully!\n');
  console.info('📊 Statistics:');
  console.info(`  ✅ Places processed: ${successCount}`);
  console.info(`  📦 Index size: ${outputSizeKB} KB`);
  console.info(`  📄 Output: ${outputPath}`);
}

/**
 * Main execution
 */
function main() {
  try {
    buildPlacesIndex();
  } catch (error) {
    console.error('\n❌ Build failed:');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { buildPlacesIndex, extractIndexFields };
