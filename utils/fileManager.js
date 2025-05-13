const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, '../ids.json');

// Initialize file if it doesn't exist
if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify([]), 'utf8');
}

// Function to get stored IDs (returns full objects)
function getStoredIds() {
    const data = fs.readFileSync(FILE_PATH, 'utf8');
    return JSON.parse(data); // Return the full array of objects
}

// Function to store an ID with current date (updated)
function storeId(id) {
    const entries = getStoredIds(); // Now returns full objects
    const exists = entries.some(entry => entry.shortCode === id);

    if (!exists) {
        const newEntry = {
            shortCode: id,
            date: new Date().toISOString()
        };
        entries.push(newEntry);
        fs.writeFileSync(FILE_PATH, JSON.stringify(entries, null, 2), 'utf8');
    }
}

// Function to check if an ID exists (updated)
function checkId(id) {
    const entries = getStoredIds();
    return entries.some(entry => entry.shortCode === id);
}

function getEntryById(id) {
    try {
        const data = fs.readFileSync(FILE_PATH, 'utf8');
        const entries = JSON.parse(data);
        return entries.find(entry => entry.shortCode === id);
    } catch (err) {
        console.error('Failed to read or parse ids.json:', err.message);
        return null;
    }
}

function getPreviousMatch(data, matchId) {
  const idMap = {};

  // Step 1: Build a map of numeric ID -> match object
  for (const match of data) {
    const numericId = parseInt(match.id.split(":")[2], 10);
    idMap[numericId] = match;
  }

  // Step 2: Get the numeric ID from the input matchId
  const numericMatchId = parseInt(matchId.split(":")[2], 10);
  const floor = 1000000000; // Optional stop point

  // Step 3: Go backwards in steps of 20000
  for (
    let previousId = numericMatchId - 20000;
    previousId >= floor;
    previousId -= 20000
  ) {
    if (idMap[previousId]) {
      return idMap[previousId]; // Found a previous match!
    }
  }

  // Step 4: No previous match found
  return null;
}

function advanceGetEntryById(idSuffix) {
    try {
        const data = fs.readFileSync(FILE_PATH, 'utf8');
        const entries = JSON.parse(data);
        return getPreviousMatch(entries, idSuffix);
    } catch (err) {
        console.error('Failed to read or parse ids.json:', err.message);
        return null;
    }
}



// Function to get all duplicates (returns object with duplicates grouped by ID)
function getDuplicates() {
    try {
        const data = fs.readFileSync(FILE_PATH, 'utf8');
        const entries = JSON.parse(data);
        console.log("Length of entries:", entries.length);
        
        // Group entries by shortCode
        const grouped = entries.reduce((acc, entry) => {
            if (!acc[entry.shortCode]) {
                acc[entry.shortCode] = [];
            }
            acc[entry.shortCode].push(entry);
            return acc;
        }, {});

        // Filter for only shortCodes with more than one entry
        const duplicates = {};
        for (const [shortCode, entries] of Object.entries(grouped)) {
            if (entries.length > 1) {
                duplicates[shortCode] = entries;
            }
        }

        return duplicates;
    } catch (err) {
        console.error('Error finding duplicates:', err.message);
        return {};
    }
}

// Function to get all entries with a specific ID (returns array of entries)
function getAllById(id) {
    if (!id || typeof id !== 'string') return [];
    
    try {
        const data = fs.readFileSync(FILE_PATH, 'utf8');
        const entries = JSON.parse(data);
        return entries.filter(entry => entry.shortCode === id);
    } catch (err) {
        console.error('Error finding entries by ID:', err.message);
        return [];
    }
}

// Function to check if an ID and tournamentId exist (updated)
function advanceCheckId(id, tournamentId) {
    const entries = getStoredIds();
    return entries.some(entry => entry.shortCode === id && entry.tournamentId === tournamentId);
}


module.exports = {
    getStoredIds,
    storeId,
    checkId,
    getEntryById,
    getDuplicates,
    getAllById,
    advanceCheckId,
    advanceGetEntryById
};