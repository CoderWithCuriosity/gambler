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

function advanceGetEntryById(idSuffix, tournamentId) {
    try {
        const data = fs.readFileSync(FILE_PATH, 'utf8');
        const entries = JSON.parse(data);

        return entries.find(entry =>
            entry.id.endsWith(idSuffix) &&
            entry.tournamentId === tournamentId
        );
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