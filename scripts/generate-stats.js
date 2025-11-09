#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function generateStats() {
  try {
    const placesPath = path.join(__dirname, '../apps/web/src/data/places.json');
    const places = JSON.parse(fs.readFileSync(placesPath, 'utf-8'));

    console.log(`Analyzing ${places.length} places...`);

    // Calculate stats
    const cuisineTypesSet = new Set();
    const amenitiesSet = new Set();
    const tagsSet = new Set();
    const priceRangesSet = new Set();
    const paymentMethodsSet = new Set();

    places.forEach((place) => {
      // Cuisine types
      if (place.cuisineTypes) {
        place.cuisineTypes.forEach((type) => cuisineTypesSet.add(type));
      }

      // Amenities
      if (place.amenities) {
        place.amenities.forEach((amenity) => amenitiesSet.add(amenity));
      }

      // Tags
      if (place.tags) {
        place.tags.forEach((tag) => tagsSet.add(tag));
      }

      // Price ranges
      if (place.priceRange) {
        priceRangesSet.add(place.priceRange);
      }

      // Payment methods
      if (place.paymentMethods) {
        place.paymentMethods.forEach((method) => paymentMethodsSet.add(method));
      }
    });

    const stats = {
      totalPlaces: places.length,
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

    // Write stats file
    const statsPath = path.join(__dirname, '../apps/web/src/data/stats.json');
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2) + '\n', 'utf-8');

    console.log('\n✓ Successfully generated stats.json');
    console.log(`\nStats Summary:`);
    console.log(`  Total Places: ${stats.totalPlaces}`);
    console.log(`  Unique Cuisines: ${stats.uniqueCuisines}`);
    console.log(`  Unique Amenities: ${stats.uniqueAmenities}`);
    console.log(`  Unique Tags: ${stats.uniqueTags}`);
    console.log(`  Price Ranges: ${stats.priceRanges.join(', ')}`);
    console.log(`  Payment Methods: ${stats.paymentMethods.length}`);

  } catch (error) {
    console.error('Error generating stats:', error);
    process.exit(1);
  }
}

generateStats();
