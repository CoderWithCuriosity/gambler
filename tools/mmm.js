const fs = require('fs');

function checkDuplicateEvery20000(data) {
  const idMap = {};
  const duplicates = []; // Array to store duplicates

  // Step 1: Organize data by numeric ID
  for (const match of data) {
    const numericId = parseInt(match.id.split(":")[2]);
    if (!idMap[numericId]) {
      idMap[numericId] = match;
    }
  }

  const checked = new Set();

  for (const baseIdStr in idMap) {
    const baseId = parseInt(baseIdStr);
    if (checked.has(baseId)) continue;

    const baseMatch = idMap[baseId];

    for (let i = 1; i <= 5; i++) {
      const offsetId = baseId + i * 20000;

      if (idMap[offsetId]) {
        const compareMatch = idMap[offsetId];

        const isDuplicate = (
          baseMatch.homeScore === compareMatch.homeScore &&
          baseMatch.awayScore === compareMatch.awayScore
        );

        if (isDuplicate) {
          // Log and save the duplicate to the array
          console.log(`Duplicate match found: ${baseMatch.id} and ${compareMatch.id}`);
          duplicates.push({
            match1: baseMatch,
            match2: compareMatch
          });
        }
      }
    }

    checked.add(baseId);
  }

  // Step 2: Save duplicates to a file
  if (duplicates.length > 0) {
    fs.writeFileSync('duplicates.json', JSON.stringify(duplicates, null, 2), 'utf-8');
    console.log('Duplicates saved to duplicates.json');
  } else {
    console.log('No duplicates found');
  }
}

const data = JSON.parse(fs.readFileSync('ids.json', 'utf-8'));
checkDuplicateEvery20000(data);
