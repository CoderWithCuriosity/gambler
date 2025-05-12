const fs = require('fs');

// Step 1: Read the JSON file
const rawData = fs.readFileSync('ids.json', 'utf8');
const matches = JSON.parse(rawData);

// Step 2: Count shortCode occurrences
const shortCodeCount = {};
matches.forEach(match => {
  shortCodeCount[match.shortCode] = (shortCodeCount[match.shortCode] || 0) + 1;
});

// Step 3: Filter matches with duplicate shortCodes
const duplicates = matches.filter(match => shortCodeCount[match.shortCode] > 1);

// Step 4: Write duplicates to a new file
fs.writeFileSync('duplicates.json', JSON.stringify(duplicates, null, 2));

console.log('Duplicates saved to duplicates.json');
