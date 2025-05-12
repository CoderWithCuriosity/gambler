const fs = require('fs');
const path = require('path');

// Load the JSON data
const data = require('./ids.json');

// Filter matches with 3:3 score and finished = true
const drawMatches = data.filter(item =>
  item.homeScore === 3 &&
  item.awayScore === 3 &&
  item.isFinished === true
);

// Log results
console.log('Matches that ended 3:3 and finished:', drawMatches.length);

// Save to file if any
if (drawMatches.length > 0) {
  const randomName = `draws_${Math.floor(Math.random() * 100000)}.json`;
  const outputPath = path.join(__dirname, randomName);

  fs.writeFileSync(outputPath, JSON.stringify(drawMatches, null, 2));
  console.log(`Saved ${drawMatches.length} draw matches to ${randomName}`);
} else {
  console.log('No 3:3 finished matches found.');
}
