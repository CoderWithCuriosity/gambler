const fs = require('fs');

// Read the data from the file
fs.readFile('ids.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  // Parse the JSON data
  const items = JSON.parse(data);

  // Create a Map to track items by shortCode
  const itemMap = new Map();
  const duplicates = [];

  // Loop through the items and find duplicates
  items.forEach(item => {
    if (itemMap.has(item.shortCode)) {
      itemMap.get(item.shortCode).push(item); // Add to the existing array of this shortCode
    } else {
      itemMap.set(item.shortCode, [item]); // Create a new array with this item
    }
  });

  // Collect duplicate items (those that have 2 or more entries in the array)
  itemMap.forEach((group) => {
    if (group.length > 1) {
      duplicates.push(...group); // Push all items in the group with duplicates
    }
  });

  // Write the duplicates (including the original items) to a new file
  fs.writeFileSync('duplicates_and_originals.json', JSON.stringify(duplicates, null, 2), 'utf8');

  const entries = fs.readFileSync('duplicates_and_originals.json', 'utf8');
  const parsedData = JSON.parse(entries);
  console.log(`Total entries with duplicates: ${parsedData.length}`);
});
