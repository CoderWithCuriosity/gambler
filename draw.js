const fs = require('fs');
const path = require('path');

// Load the JSON data
const data = require('./ids.json');

// Filter matches with 3:3 score and finished = true
const r_matches = data.filter(item =>
  item.homeScore === 0 &&
  item.awayScore === 0 &&
  item.isFinished === true
);

// Log results
console.log('Matches that ended 0:0 and finished:', r_matches.length);

// Save to file if any
if (r_matches.length > 0) {
  const randomName = `r_${Math.floor(Math.random() * 100000)}.json`;
  const outputPath = path.join(__dirname, randomName);

  fs.writeFileSync(outputPath, JSON.stringify(r_matches, null, 2));
  console.log(`Saved ${r_matches.length} matches to ${randomName}`);
} else {
  console.log('No finished matches found.');
}
