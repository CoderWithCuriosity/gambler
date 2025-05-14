// const {getDuplicates} = require('./utils/fileManager');

// const duplicate = getDuplicates();
// console.log(duplicate);

const fs = require('fs');

// Read the data from the file
fs.readFile('ids.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  // Parse the JSON data
  const items = JSON.parse(data);

  // Create a Set to keep track of shortCode values to ensure uniqueness
  const uniqueItems = [];
  const seenShortCodes = new Set();

  // Filter out duplicates based on shortCode
  items.forEach(item => {
    if (!seenShortCodes.has(item.shortCode)) {
      seenShortCodes.add(item.shortCode);
      uniqueItems.push(item);
    }
  });

  // Write the cleaned data to a new file
  fs.writeFileSync('cleaned_ids.json', JSON.stringify(uniqueItems, null, 2), "utf8");

  const entries = fs.readFileSync("cleaned_ids.json", "utf8");
  const parsedData = JSON.parse(entries);
  console.log(parsedData.length);
});
