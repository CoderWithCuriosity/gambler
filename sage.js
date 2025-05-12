function getResults(id, shortCode) {
  // Parse the numeric ID from the input
  const numericId = parseInt(id.replace("vf:data:", ""), 10);

  // Use some different math tricks with modulo operations
  const _in = (numericId % 8 + shortCode % 8) % 8;  // Combining numericId and shortCode with mod 8
  const _out = (numericId % 9 + shortCode % 9) % 9; // Combining numericId and shortCode with mod 9

  // Return results
  return { _in, _out };
}

const dataset = [
  { id: "vf:data:1381208869", shortCode: 3990, _in: 7, _out: 5 },
  { id: "vf:data:1381208868", shortCode: 7665, _in: 6, _out: 8 },
];

// For each data set, calculate and compare
dataset.forEach(data => {
  const calculated = getResults(data.id, data.shortCode);
  console.log(
    `ID: ${data.id.split(":")[2]}, ` +
    `ShortCode: ${data.shortCode}, ` +
    `Calculated: ${calculated._in}-${calculated._out} ` +
    `${calculated._in === data._in && calculated._out === data._out ? "✅" : "❌"}`
  );
});
