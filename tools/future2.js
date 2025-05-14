const fs = require('fs');

// Load the JSON data (replace with your actual file path)
const data = require('../ids.json');

// Store potential matches based on swapped criteria
const potentialMatches = [];

// Loop through each match entry in the data
data.forEach((match, index) => {
    const lastFourDigits = match.id.slice(-4);  // Extract the last 4 digits from 'id'
    const shortCode = match.shortCode;
    const lastDigit = match.id.slice(-1);  // Extract the last digit of 'id'

    // Loop through other matches to find potential swapped duplicates
    for (let i = 0; i < data.length; i++) {
        if (i !== index) {  // Don't compare the match to itself
            const compareMatch = data[i];
            const compareLastFourDigits = compareMatch.id.slice(-4);
            const compareShortCode = compareMatch.shortCode;
            const compareLastDigit = compareMatch.id.slice(-1);

            // Check if the shortCode is the last four digits, and the last digit matches shortCode
            if (lastFourDigits === compareShortCode && lastDigit === compareLastFourDigits) {
                potentialMatches.push({
                    match1: match,
                    match2: compareMatch
                });
            }
        }
    }
});

// Output the results
if (potentialMatches.length > 0) {
    console.log("Found swapped matches:");
    console.log(JSON.stringify(potentialMatches, null, 2));

    // Save the swapped matches to a file
    fs.writeFileSync('swapped_matches.json', JSON.stringify(potentialMatches, null, 2));
} else {
    console.log("No swapped matches found.");
}
