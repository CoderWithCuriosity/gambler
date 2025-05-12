function getResults(id, shortCode) {
  const numericId = parse_int(id.replace("vf:data:", ""), 10);
  const hash = (numericId * 0x9e3779b9) ^ (shortCode * 0x85ebca77);
  const _in = Math.abs((hash >> 16) % 8);
  const _out = Math.abs((hash >> 8) % 9);
  return { _in, _out };
}

// Your dataset
const dataset = [
  { id: "vf:data:1381208869", shortCode: 3990, _in: 7, _out: 5 },
  { id: "vf:data:1381208868", shortCode: 7665, _in: 6, _out: 8 },
  { id: "vf:data:1381199987", shortCode: 8703, _in: 0, _out: 1 },
  { id: "vf:data:1381199986", shortCode: 5580, _in: 3, _out: 1 },
  { id: "vf:data:1381199993", shortCode: 6207, _in: 1, _out: 2 },
  { id: "vf:data:1381199992", shortCode: 1482, _in: 4, _out: 0 },
  { id: "vf:data:1381200023", shortCode: 9623, _in: 0, _out: 4 },
  { id: "vf:data:1381200022", shortCode: 2497, _in: 4, _out: 0 },
  { id: "vf:data:1381200029", shortCode: 8407, _in: 3, _out: 0 },
  { id: "vf:data:1381200028", shortCode: 7234, _in: 2, _out: 2 },
  { id: "vf:data:1381196451", shortCode: 3166, _in: 0, _out: 2 },
  { id: "vf:data:1381196450", shortCode: 3406, _in: 2, _out: 0 }
];

for (const data of dataset) {
  const calculated = getResults(data.id, data.shortCode);
  console.log(
    `ID: ${data.id.split(":")[2]}, ` +
      `ShortCode: ${data.shortCode}, ` +
      `Expected: ${data._in}-${data._out}, ` +
      `Calculated: ${calculated._in}-${calculated._out} ` +
      `${calculated._in === data._in && calculated._out === data._out
        ? "✅"
        : "❌"}`
  );
}
