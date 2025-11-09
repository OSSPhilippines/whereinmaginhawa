#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixPlaces8Ids() {
  try {
    const filePath = path.join(__dirname, '../apps/web/src/data/places-8.json');

    // Read the file
    const content = fs.readFileSync(filePath, 'utf-8');
    const places = JSON.parse(content);

    console.log(`Loaded ${places.length} places from places-8.json`);
    console.log(`Current ID range: ${places[0].id} - ${places[places.length - 1].id}`);

    // Increment all IDs by 1 (shift from 201-224 to 202-225)
    places.forEach((place) => {
      const oldId = place.id;
      place.id = String(parseInt(place.id) + 1);
      console.log(`  ${oldId} → ${place.id}`);
    });

    // Write back
    fs.writeFileSync(
      filePath,
      JSON.stringify(places, null, 2) + '\n',
      'utf-8'
    );

    console.log(`\n✓ Fixed IDs in places-8.json`);
    console.log(`New ID range: ${places[0].id} - ${places[places.length - 1].id}`);

  } catch (error) {
    console.error('Error fixing IDs:', error);
    process.exit(1);
  }
}

fixPlaces8Ids();
