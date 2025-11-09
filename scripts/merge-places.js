#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function mergePlaces() {
  try {
    // Find all places-*.json files
    const dataDir = path.join(__dirname, '../apps/web/src/data');
    const allFiles = fs.readdirSync(dataDir);
    const files = allFiles
      .filter(file => file.startsWith('places-') && file.endsWith('.json'))
      .sort();

    console.log(`Found ${files.length} place files to merge:`);
    files.forEach(file => console.log(`  - ${file}`));

    // Read and parse all files
    const allPlaces = [];

    for (const file of files) {
      const filePath = path.join(dataDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);

      // Handle both array and single object formats
      if (Array.isArray(data)) {
        allPlaces.push(...data);
        console.log(`\n✓ Loaded ${data.length} places from ${file}`);
      } else {
        allPlaces.push(data);
        console.log(`\n✓ Loaded 1 place from ${file}`);
      }
    }

    // Sort by ID to ensure consistent ordering
    allPlaces.sort((a, b) => {
      const idA = parseInt(a.id);
      const idB = parseInt(b.id);
      return idA - idB;
    });

    // Write merged file
    const outputPath = path.join(dataDir, 'places.json');
    fs.writeFileSync(
      outputPath,
      JSON.stringify(allPlaces, null, 2) + '\n',
      'utf-8'
    );

    console.log(`\n✓ Successfully merged ${allPlaces.length} places into places.json`);
    console.log(`\nPlace IDs: ${allPlaces.map(p => p.id).join(', ')}`);

  } catch (error) {
    console.error('Error merging places:', error);
    process.exit(1);
  }
}

mergePlaces();
