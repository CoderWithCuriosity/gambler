const fs = require('fs');

// Read the input file
fs.readFile('ids.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading ids.json:', err);
    return;
  }

  const matches = JSON.parse(data);

  const extraction = matches.map(match => {
    const matchId = match.id;
    const shortCode = match.shortCode;
    const idPart = matchId.split(':')[2]; // e.g., 1381320635
    const lastFourDigits = parseInt(idPart.slice(-4)); // e.g., 0635 => 635
    const newId = Math.abs(lastFourDigits - shortCode);

    return {
      id: newId,
      matchId: matchId,
      shortCode: shortCode,
      score: `${match.homeScore}:${match.awayScore}`,
      name: match.name,
      tournamentName: match.tournamentName
    };
  });

  // Write to extraction.json
  fs.writeFile('extraction.json', JSON.stringify(extraction, null, 2), err => {
    if (err) {
      console.error('Error writing extraction.json:', err);
    } else {
      console.log('✅ extraction.json created successfully!');
    }
  });
});
