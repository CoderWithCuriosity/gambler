const fs = require('fs');

/**
 * Finds the most recent previous match that has the same score as the provided matchId.
 * It searches backward in steps of 20000 from the numeric part of the match ID.
 *
 * @param {Array} data - Array of match objects with 'id', 'homeScore', and 'awayScore'.
 * @param {string} matchId - The match ID in the format "vf:match:123456789".
 * @returns {Object|null} - The previous duplicate match object or null if none found.
 */
function getPreviousDuplicateMatch(data, matchId) {
  const idMap = {};

  // Step 1: Map numeric IDs to match objects
  for (const match of data) {
    const numericId = parseInt(match.id.split(":")[2], 10);
    idMap[numericId] = match;
  }

  // Step 2: Parse the numeric ID from the given matchId
  const numericMatchId = parseInt(matchId.split(":")[2], 10);
  const baseMatch = idMap[numericMatchId];

  // If the match doesn't exist in the dataset, return null
  if (!baseMatch) return null;

  // Step 3: Search backward in steps of 20000
  const floor = 1000000000; // Stop checking when this threshold is reached

  for (
    let previousId = numericMatchId - 20000;
    previousId >= floor;
    previousId -= 20000
  ) {
    if (idMap[previousId]) {
      const compareMatch = idMap[previousId];

      const isDuplicate =
        baseMatch.homeScore === compareMatch.homeScore &&
        baseMatch.awayScore === compareMatch.awayScore;

      if (isDuplicate) {
        return compareMatch;
      }
    }
  }

  // If no duplicates were found
  return null;
}

// Example usage:
const data = JSON.parse(fs.readFileSync('ids.json', 'utf-8'));

const matchIdToCheck = 'vf:match:1381281284';
const previousDuplicateMatch = getPreviousDuplicateMatch(data, matchIdToCheck);

if (previousDuplicateMatch) {
  console.log('Previous duplicate match found:', previousDuplicateMatch);
} else {
  console.log('No previous duplicate match found');
}
