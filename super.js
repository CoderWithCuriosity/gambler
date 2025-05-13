const fs = require("fs");

// Load the dataset from the file
const dataset = JSON.parse(fs.readFileSync("first10_01.json", "utf-8"));

// Function to generate scores based on id and shortCode
function generateScores(id, shortCode) {
  // Extract the numeric part from id string like "vf:match:1381199987"
  const idNum = parseInt(id.split(":")[2]);

  // Compute _in using modulo logic
  const _in = idNum % shortCode % 2;

  // Set _out as the inverse of _in
  const _out = 1 - _in;

  return { _in, _out };
}

// Main checker
let passed = [];
let failed = [];

dataset.forEach(data => {
  const generated = generateScores(data.id, data.shortCode);

  if (data._in === generated._in && data._out === generated._out) {
    passed.push(data.id);
  } else {
    failed.push({
      id: data.id,
      expected: { _in: data._in, _out: data._out },
      generated
    });
  }
});

// Output
console.log(`✅ Passed: ${passed.length}`);
console.log(`❌ Failed: ${failed.length}`);

if (failed.length > 0) {
  console.log("\n--- Failed dataset ---");
  failed.forEach(f => {
    console.log(`ID: ${f.id}`);
    console.log(`  Expected: _In ${f.expected._in}, _out ${f.expected._out}`);
    console.log(
      `  Generated: _In ${f.generated._in}, _out ${f.generated._out}\n`
    );
  });
}
