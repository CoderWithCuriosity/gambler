const fs = require('fs');

// Load the JSON data (replace with your actual file path)
const data = require('../ids.json');

// Store duplicates based on last four digits and shortCode
const duplicates = [];

// Loop through each match entry in the data
data.forEach((match, index) => {
    const lastFourDigits = match.id.slice(-4);  // Extract the last 4 digits from 'id'
    const shortCode = match.shortCode;

    // Loop through other matches to find duplicates
    for (let i = 0; i < data.length; i++) {
        if (i !== index) {  // Don't compare the match to itself
            const compareMatch = data[i];
            const compareLastFourDigits = compareMatch.id.slice(-4);
            const compareShortCode = compareMatch.shortCode;

            // Check if both the last four digits and shortCode match
            if (lastFourDigits === compareLastFourDigits && shortCode === compareShortCode) {
                duplicates.push({
                    original: match,
                    duplicate: compareMatch
                });
            }
        }
    }
});

// Output the results
if (duplicates.length > 0) {
    console.log("Found similar matches:");
    console.log(JSON.stringify(duplicates, null, 2));

    // Save the duplicates to a file
    fs.writeFileSync('duplicates.json', JSON.stringify(duplicates, null, 2));
} else {
    console.log("No similar matches found.");
}
