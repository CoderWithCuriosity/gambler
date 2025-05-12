const fs = require('fs');

// Read data
const rawData = fs.readFileSync('ids.json', 'utf8');
const matches = JSON.parse(rawData);

// Step 1: Find duplicate shortCodes
const shortCodeMap = {};
matches.forEach(match => {
  shortCodeMap[match.shortCode] = (shortCodeMap[match.shortCode] || 0) + 1;
});

// Get duplicate shortCodes
const duplicateShortCodes = Object.entries(shortCodeMap)
  .filter(([code, count]) => count > 1)
  .map(([code]) => parseInt(code));

// Get all entries with duplicate shortCodes
const duplicates = matches.filter(match =>
  duplicateShortCodes.includes(match.shortCode)
);

// Save duplicates.json
fs.writeFileSync('duplicates.json', JSON.stringify(duplicates, null, 2));
console.log(`✅ Saved ${duplicates.length} duplicates to duplicates.json`);

// Build a Set of score signatures from the duplicates
const scoreSet = new Set(
  duplicates.map(match => `${match.homeScore}-${match.awayScore}`)
);

// Step 2: Keep entries where:
// - last 4 digits of ID match any duplicate shortCode
// - and their score matches any of the duplicates
const strictFiltered = matches.filter(match => {
  const numericId = match.id.split(':').pop();
  const last4 = parseInt(numericId.slice(-4));
  const scoreKey = `${match.homeScore}-${match.awayScore}`;

  return (
    duplicateShortCodes.includes(last4) &&
    scoreSet.has(scoreKey)
  );
});

// Save strict_duplicates.json
fs.writeFileSync('strict_duplicates.json', JSON.stringify(strictFiltered, null, 2));
console.log(`✅ Saved ${strictFiltered.length} strict matches to strict_duplicates.json`);
