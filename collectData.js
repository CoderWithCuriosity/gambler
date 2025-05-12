const fs = require("fs");
const axios = require("axios");

// Import fetchMatches and getMatchOdds from your module
const { fetchMatches, getMatchOdds } = require("./api/matches");

// File to store match results
const outputFile = "results.json";

// Store the match result
async function storeMatchResult(
  matchData,
  homeScore,
  awayScore,
  isFinished = true
) {
  const result = {
    id: matchData.id, // Store match.id as the ID
    shortCode: matchData.shortCode, // Store shortCode separately
    date: new Date().toISOString(), // Current date
    time: matchData.scheduledDate, // Time of the match
    homeScore,
    awayScore,
    type: getMatchType(homeScore, awayScore),
    isFinished // Track whether the match has ended or not
  };

  let existingData = [];
  if (fs.existsSync(outputFile)) {
    existingData = JSON.parse(fs.readFileSync(outputFile));
  }

  // Check if match already exists, update if necessary
  const matchIndex = existingData.findIndex(m => m.id === matchData.id);
  if (matchIndex !== -1) {
    existingData[matchIndex] = result;
  } else {
    existingData.push(result);
  }

  fs.writeFileSync(outputFile, JSON.stringify(existingData, null, 2));

  console.log("✅ Match result stored");
}

// Determine match outcome type
function getMatchType(homeScore, awayScore) {
  if (homeScore > awayScore) return 1; // Home win
  if (homeScore === awayScore) return 2; // Draw
  return 3; // Away win
}

// Poll API and store result when match ends or starts
async function checkAndStoreMatchData() {
  try {
    const matches = await fetchMatches();

    // Iterate through matches and store match IDs (shortCode)
    let existingData = [];
    if (fs.existsSync(outputFile)) {
      existingData = JSON.parse(fs.readFileSync(outputFile));
    }

    for (let match of existingData) {
      const oddsData = await getMatchOdds(match.id);
      if (oddsData.matchStatus == "ended" && !match.isFinished) {
        console.log(
          `[${new Date().toLocaleTimeString()}] Match ended: ${match.id}`
        );
        await storeMatchResult(match, oddsData.homeScore, oddsData.awayScore);
      }
    }

    for (const match of matches) {
      const matchIndex = existingData.findIndex(m => m.id === match.id);

      if (matchIndex === -1) {
        console.log(
          `[${new Date().toLocaleTimeString()}] 🆕 Storing match ID ${match.id}`
        );
        existingData.push({
          id: match.id,
          shortCode: match.shortCode,
          isFinished: false,
          homeScore: 0,
          awayScore: 0
        });
      } else {
        const oddsData = await getMatchOdds(match.id);
        if (
          oddsData &&
          oddsData.homeScore !== undefined &&
          oddsData.awayScore !== undefined
        ) {
          existingData[matchIndex].homeScore = oddsData.homeScore;
          existingData[matchIndex].awayScore = oddsData.awayScore;

          // Check if match has ended
          if (
            oddsData.matchStatus === "ended" &&
            !existingData[matchIndex].isFinished
          ) {
            console.log(
              `[${new Date().toLocaleTimeString()}] Match ended: ${match.id}`
            );
            await storeMatchResult(
              match,
              oddsData.homeScore,
              oddsData.awayScore
            );
            existingData[matchIndex].isFinished = true;
          } else {
            console.log(
              `[${new Date().toLocaleTimeString()}] ⏳ Updating live scores for match ${match.id}`
            );
          }
        }
      }
    }

    fs.writeFileSync(outputFile, JSON.stringify(existingData, null, 2));

    // Check stored matches if they have ended using getMatchOdds
    for (const match of existingData) {
      if (!match.isFinished) {
        const oddsData = await getMatchOdds(match.id); // Using match.id to get odds

        if (
          oddsData &&
          oddsData.homeScore !== undefined &&
          oddsData.awayScore !== undefined
        ) {
          const homeScore = oddsData.homeScore;
          const awayScore = oddsData.awayScore;

          if (match.matchStatus == "ended") {
            // Match has ended, store the result
            console.log(
              `[${new Date().toLocaleTimeString()}] Match ended: ${match.id}`
            );
            await storeMatchResult(match, homeScore, awayScore);
            match.isFinished = true; // Mark as finished
          }
        }
      }
    }

    // Update the results file with final status
    fs.writeFileSync(outputFile, JSON.stringify(existingData, null, 2));
  } catch (error) {
    console.error("❌ Error during match check:", error.message);
  }
}

// Poll every 3 minutes (180,000 ms)
const watcher = setInterval(checkAndStoreMatchData, 180000);

// Optionally: check once immediately when script runs
checkAndStoreMatchData();
