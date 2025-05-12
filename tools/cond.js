const fs = require('fs');
const path = require('path');

// Load the JSON file
const data = require('../ids.json');

// Target last 4 digits
const targetEnding = '9986';

// Filter matches based on ID ending
const matchingItems = data.filter(item => {
  const parts = item.id.split(':');
  const idNumber = parts[2]; // e.g. 1381199987
  return idNumber.endsWith(targetEnding);
});

// Log matching shortCodes
console.log('Matching shortCodes:', matchingItems.map(item => item.shortCode));

// Save to random file if matches are found
if (matchingItems.length > 1) {
  const randomName = `matches_${Math.floor(Math.random() * 100000)}.json`;
  const outputPath = path.join(__dirname, randomName);

  fs.writeFileSync(outputPath, JSON.stringify(matchingItems, null, 2));
  console.log(`Saved ${matchingItems.length} matching items to ${randomName}`);
} else {
  console.log('No matches found. or 1 match found');
}
