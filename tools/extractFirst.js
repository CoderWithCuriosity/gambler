const fs = require('fs');

// Step 1: Read the original file
const data = JSON.parse(fs.readFileSync('ids.json', 'utf-8'));

const quantity = 3;

// Step 2: Slice the first entries
const first10 = data.slice(0, quantity);

// Step 3: Remove unwanted fields from each match
const cleanFirst10 = first10.map(match => {
  const { 
    name, 
    tournamentName, 
    tournamentId, 
    homeTeamName, 
    awayTeamName, 
    homeTeamNameAlias, 
    awayTeamNameAlias,
    homeScore,
    awayScore, 
    ...rest 
  } = match;

    // Modify fields as needed
  const modifiedMatch = {
    ...rest,
    _in: homeScore, 
    _out: awayScore
  };

  return modifiedMatch; 
});

// Step 4: Write to a new file
fs.writeFileSync(`first${quantity}.json`, JSON.stringify(cleanFirst10, null, 2));

console.log(`Saved first ${quantity} entries with cleaned data to first${quantity}.json`);