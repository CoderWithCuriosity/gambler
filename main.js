const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { loginToBangBet } = require('./api/auth');
const { placeBet } = require('./api/bet');
const { win_or_draw } = require('./strategy/win_or_draw');
const { advanceGetEntryById } = require('./utils/fileManager');
const { fetchMatches, getMatchOdds } = require("./api/matches");

const BOT_TOKEN = '7299748052:AAHJKWCStrsnSg_e5YfWctTNnVQYUlNp8Hs';
const USER_ID = '6524312327';
const outputFile = "ids.json";

async function sendMatchToTelegram(match, entry) {
  const baseUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const message = `
⚽ *${match.eventName}*
📅 *Scheduled Time:* ${match.scheduledTime}
🏠 *Home Score:* ${entry.homeScore}
🛫 *Away Score:* ${entry.awayScore}
🎯 *Correct Score:* ${entry.homeScore}:${entry.awayScore}
🆔 *Match ID:* ${match.eventId}
🏆 *Tournament ID:* ${match.tournamentId}
🔁 *Previous Match ID:* ${entry.id}
📝 *Cloned Match Name:* ${entry.name}
`.trim();

  try {
    const response = await axios.post(baseUrl, {
      chat_id: USER_ID,
      text: message,
      parse_mode: "Markdown"
    });
    console.log('✅ Message sent to Telegram.');
    return response;
  } catch (error) {
    console.error('❌ Telegram error:', error.message);
  }
}

async function main() {
  console.log(`[${new Date().toLocaleTimeString()}] 🔄 Running main function...`);

  try {
    const [moneyMatches, ids, selections] = await win_or_draw(100);

    if (!selections.length) {
      console.log("⚠️ No valid selections found.");
      return;
    }

    const messages = await Promise.all(ids.map((id, i) => {
        const match = moneyMatches[i];
        const entry = advanceGetEntryById(id);
        if (!entry) return null;
        return sendMatchToTelegram(match, entry);
    }));

    // Uncomment to enable betting
    /*
    const credentials = await loginToBangBet();
    if (!credentials) {
      console.log('❌ Login failed.');
      return;
    }

    console.log("🎯 Placing combo bet on:");
    selections.forEach(sel =>
      console.log(`${sel.eventName} (${sel.outcomeName} @ ${sel.odds})`)
    );

    await placeBet(credentials.token, credentials.secretKey, selections);
    */
  } catch (err) {
    console.error("❌ Error in main:", err.message);
  }
}

function getMatchType(home, away) {
  if (home > away) return 1;
  if (home === away) return 2;
  return 3;
}

async function storeMatchResult(matchData, homeScore, awayScore, isFinished = true) {
  const result = {
    id: matchData.id,
    shortCode: matchData.shortCode,
    date: new Date().toISOString(),
    time: matchData.scheduledDate,
    name: matchData.name,
    tournamentName: matchData.tournamentName,
    tournamentId: matchData.tournamentId,
    homeTeamName: matchData.homeTeamName,
    awayTeamName: matchData.awayTeamName,
    homeTeamNameAlias: matchData.homeTeamNameAlias,
    awayTeamNameAlias: matchData.awayTeamNameAlias,
    homeScore,
    awayScore,
    type: getMatchType(homeScore, awayScore),
    isFinished
  };

  let data = fs.existsSync(outputFile)
    ? JSON.parse(fs.readFileSync(outputFile))
    : [];

  const idx = data.findIndex(m => m.id === matchData.id);
  if (idx !== -1) {
    data[idx] = result;
  } else {
    data.push(result);
  }

  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
  console.log("✅ Match result stored.");
}

async function checkAndStoreMatchData() {
  try {
    const matches = await fetchMatches();
    let data = fs.existsSync(outputFile)
      ? JSON.parse(fs.readFileSync(outputFile))
      : [];

    for (const match of matches) {
      const idx = data.findIndex(m => m.id === match.id);

      if (idx === -1) {
        console.log(`[${new Date().toLocaleTimeString()}] 🆕 Adding new match ID: ${match.id}`);
        data.push({
          id: match.id,
          shortCode: match.shortCode,
          name: match.name,
          tournamentName: match.tournamentName,
          tournamentId: match.tournamentId,
          isFinished: false,
          homeScore: 0,
          awayScore: 0
        });
      } else {
        const odds = await getMatchOdds(match.id);
        if (odds) {
          data[idx].homeScore = odds.homeScore ?? 0;
          data[idx].awayScore = odds.awayScore ?? 0;

          if (odds.matchStatus === "ended" && !data[idx].isFinished) {
            console.log(`[${new Date().toLocaleTimeString()}] ✅ Match ended: ${match.id}`);
            await storeMatchResult(match, odds.homeScore, odds.awayScore);
            data[idx].isFinished = true;
          }
        }
      }
    }

    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Error during match check:", err.message);
  }
}

async function updateMatchIfFinished() {
  try {
    let data = fs.existsSync(outputFile)
      ? JSON.parse(fs.readFileSync(outputFile))
      : [];

    for (let match of data) {
      if (!match.isFinished) {
        const odds = await getMatchOdds(match.id);
        if (odds && odds.matchStatus === "ended") {
          Object.assign(match, {
            homeScore: odds.homeScore,
            awayScore: odds.awayScore,
            isFinished: true
          });
          console.log(`✅ Updated finished match: ${match.id}`);
        }
      }
    }

    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Error updating finished matches:", err.message);
  }
}

// === Run initial executions ===
main();

// === Start periodic intervals ===
setInterval(async () => {
  updateMatchIfFinished();
  await main();
}, 3 * 60 * 1000);

// Every 1.5 minutes
setInterval(checkAndStoreMatchData, 90000); // Every 3 minutes
