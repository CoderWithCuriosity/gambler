const fs = require('fs');

// Step 1: Read the original file
const data = JSON.parse(fs.readFileSync('ids.json', 'utf-8'));

// Step 2: Filter for homeScore: 0 and awayScore: 1
const filtered = data.filter(match => match.homeScore === 0 && match.awayScore === 1);

// Step 3: Get the first 10 matching entries
const quantity = 10;
const first10 = filtered.slice(0, quantity);

// Step 4: Remove unwanted fields from each match
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

// Step 5: Write to a new file
fs.writeFileSync(`first${quantity}_01.json`, JSON.stringify(cleanFirst10, null, 2));

console.log(`Saved first ${quantity} entries with homeScore:0 and awayScore:1 to first${quantity}_01.json`);
