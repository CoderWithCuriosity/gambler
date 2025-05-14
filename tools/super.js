const fs = require('fs');
const { get } = require('http');
const file = "/ids.json";

function getPreviousMatch(data, matchId) {
  const idMap = {};

  // Step 1: Build a map of numeric ID -> match object
  for (const match of data) {
    const numericId = parseInt(match.id.split(":")[2], 10);
    idMap[numericId] = match;
  }

  // Step 2: Extract numeric ID from the given matchId
  const numericMatchId = parseInt(matchId.split(":")[2], 10);
  const floor = 1000000000; // Optional lower bound for stopping point

  // Step 3: Step backwards to find a previous match
  for (
    let previousId = numericMatchId - 20000;
    previousId >= floor;
    previousId -= 20000
  ) {
    const baseMatch = idMap[previousId];
    if (!baseMatch) continue;

    // Step 4: Check for duplicates and count them
    let duplicateCount = 0;
    for (let i = 0; i <= 5; i++) {
      const offsetId = previousId + i * 20000;
      const compareMatch = idMap[offsetId];

      if (
        compareMatch &&
        baseMatch.homeScore === compareMatch.homeScore &&
        baseMatch.awayScore === compareMatch.awayScore
      ) {
        duplicateCount++; // Increment duplicate count if found
      }
    }

    // Step 5: If there are exactly 1 duplicate (making 2 total matches), return the previous match
    if (duplicateCount === 1) {
      return baseMatch; // Return the previous match
    }

    // Step 6: If there are more than 1 duplicate, skip this match and continue searching
  }

  // Step 7: No valid previous match with acceptable duplicates found
  return null;
}


const data = fs.readFileSync(__dirname + file, 'utf8');
const entries = JSON.parse(data);
for(const entry of entries) {
    const prev = getPreviousMatch(entries, entry.id);
    if(prev) {
        console.log(`Previous match for ${entry.id}: ${prev.id}`);
    }
}