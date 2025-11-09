#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

/**
 * Build Stats Script
 *
 * Reads all individual place files from apps/web/src/data/places/*.json
 * Aggregates statistics (counts, unique values, etc.)
 * Generates stats.json for homepage and analytics
 *
 * Usage: tsx scripts/build-stats.ts
 */

type Place = {
  priceRange: string;
  paymentMethods: string[];
  cuisineTypes: string[];
  amenities: string[];
  tags: string[];
  [key: string]: any;
};

type Stats = {
  totalPlaces: number;
  uniqueCuisines: number;
  uniqueAmenities: number;
  uniqueTags: number;
  priceRanges: string[];
  paymentMethods: string[];
  cuisineTypes: string[];
  amenities: string[];
  tags: string[];
  generatedAt: string;
};

/**
 * Build statistics from individual place files
 */
function buildStats() {
  const rootDir = process.cwd();
  const placesDir = path.join(rootDir, 'apps/web/src/data/places');
  const outputPath = path.join(rootDir, 'apps/web/src/data/stats.json');

  console.info('📊 Building statistics...\n');
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

  console.info(`📄 Processing ${files.length} place files...\n`);

  // Aggregate data
  const priceRangesSet = new Set<string>();
  const paymentMethodsSet = new Set<string>();
  const cuisineTypesSet = new Set<string>();
  const amenitiesSet = new Set<string>();
  const tagsSet = new Set<string>();

  let successCount = 0;
  let errorCount = 0;

  files.forEach(file => {
    const filePath = path.join(placesDir, file);

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const place: Place = JSON.parse(content);

      // Collect unique values
      if (place.priceRange) {
        priceRangesSet.add(place.priceRange);
      }

      if (place.paymentMethods && Array.isArray(place.paymentMethods)) {
        place.paymentMethods.forEach(method => paymentMethodsSet.add(method));
      }

      if (place.cuisineTypes && Array.isArray(place.cuisineTypes)) {
        place.cuisineTypes.forEach(cuisine => cuisineTypesSet.add(cuisine));
      }

      if (place.amenities && Array.isArray(place.amenities)) {
        place.amenities.forEach(amenity => amenitiesSet.add(amenity));
      }

      if (place.tags && Array.isArray(place.tags)) {
        place.tags.forEach(tag => tagsSet.add(tag));
      }

      successCount++;
    } catch (error) {
      errorCount++;
      console.error(`  ❌ ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  if (errorCount > 0) {
    console.error(`\n❌ Failed to process ${errorCount} file(s)`);
    process.exit(1);
  }

  // Convert sets to sorted arrays
  const stats: Stats = {
    totalPlaces: successCount,
    uniqueCuisines: cuisineTypesSet.size,
    uniqueAmenities: amenitiesSet.size,
    uniqueTags: tagsSet.size,
    priceRanges: Array.from(priceRangesSet).sort(),
    paymentMethods: Array.from(paymentMethodsSet).sort(),
    cuisineTypes: Array.from(cuisineTypesSet).sort(),
    amenities: Array.from(amenitiesSet).sort(),
    tags: Array.from(tagsSet).sort(),
    generatedAt: new Date().toISOString(),
  };

  // Write to output file
  const output = JSON.stringify(stats, null, 2);
  fs.writeFileSync(outputPath, output, 'utf-8');

  // Calculate file sizes
  const outputSizeKB = (output.length / 1024).toFixed(2);

  console.info('✨ Statistics built successfully!\n');
  console.info('📊 Summary:');
  console.info(`  ✅ Places processed: ${stats.totalPlaces}`);
  console.info(`  🍽️  Unique cuisines: ${stats.uniqueCuisines}`);
  console.info(`  ⭐ Unique amenities: ${stats.uniqueAmenities}`);
  console.info(`  🏷️  Unique tags: ${stats.uniqueTags}`);
  console.info(`  💰 Price ranges: ${stats.priceRanges.join(', ')}`);
  console.info(`  📦 File size: ${outputSizeKB} KB`);
  console.info(`  📄 Output: ${outputPath}`);
}

/**
 * Main execution
 */
function main() {
  try {
    buildStats();
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

export { buildStats };
