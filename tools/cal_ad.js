const fs = require('fs');
const path = require('path');

// Step 1: Read the ids.json file
fs.readFile('ids.json', 'utf8', (err, data) => {
  if (err) {
    console.error('❌ Error reading ids.json:', err);
    return;
  }

  const matches = JSON.parse(data);

  // Step 2: Process and create extraction data
  const extraction = matches.map(match => {
    const matchId = match.id;
    const shortCode = match.shortCode;
    const idPart = matchId.split(':')[2]; // e.g., 1381320635
    const lastFourDigits = parseInt(idPart.slice(-4)); // e.g., 0635 => 635
    const newId = Math.abs(lastFourDigits + shortCode);

    return {
      id: newId,
      matchId: matchId,
      shortCode: shortCode,
      score: `${match.homeScore}:${match.awayScore}`,
      name: match.name,
      tournamentName: match.tournamentName
    };
  });

  // Step 3: Write extraction.json
  fs.writeFile('extraction.json', JSON.stringify(extraction, null, 2), err => {
    if (err) {
      console.error('❌ Error writing extraction.json:', err);
      return;
    }

    console.log('✅ extraction.json created successfully!');

    // Step 4: Read back and check for duplicates
    fs.readFile('extraction.json', 'utf8', (err, extractedData) => {
      if (err) {
        console.error('❌ Error reading extraction.json:', err);
        return;
      }

      const parsed = JSON.parse(extractedData);
      const idMap = new Map();
      const duplicates = [];

      parsed.forEach(entry => {
        if (idMap.has(entry.id)) {
          // Save both original and duplicate if not already added
          const existing = idMap.get(entry.id);
          if (!duplicates.some(d => d.matchId === existing.matchId)) {
            duplicates.push(existing);
          }
          duplicates.push(entry);
        } else {
          idMap.set(entry.id, entry);
        }
      });

      if (duplicates.length > 0) {
        fs.writeFile('duplicates.json', JSON.stringify(duplicates, null, 2), err => {
          if (err) {
            console.error('❌ Error writing duplicates.json:', err);
          } else {
            console.log(`⚠️  Found and saved ${duplicates.length} duplicate entries to duplicates.json`);
          }
        });
      } else {
        console.log('✅ No duplicate IDs found.');
      }
    });
  });
});
