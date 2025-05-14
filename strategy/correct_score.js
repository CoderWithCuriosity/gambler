const { fetchMatches, getMatchOdds } = require('../api/matches');
const { advanceGetEntryById } = require('../utils/fileManager');
const axios = require('axios');

async function sendMatchToTelegram(match) {
    const BOT_TOKEN = '7299748052:AAHJKWCStrsnSg_e5YfWctTNnVQYUlNp8Hs';
    const USER_ID = '6524312327';
    const baseUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  
    const message = `
  ⚽  *${match.eventName}*
  📅 *Scheduled Time:* ${match.scheduledTime}
    *Match ID:* ${match.eventId}
    `.trim();
  
    try {
      const response = await axios.post(baseUrl, {
        chat_id: USER_ID,
        text: message,
        parse_mode: "Markdown"
      });
  
      console.log('Message sent successfully.');
      return response;
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
  }

function checkMatchID(matchString, prefix = "138132") {
    // Extract the match ID from the string, assuming format "vf:match:ID"
    const parts = matchString.split(":");
    if (parts.length !== 3) return false;

    const matchID = parts[2];
    return matchID.startsWith(prefix);
}

async function correct_score(amount = 100, matchCount = 9999) {
    //Using match Count to limit the number of matches to fetch
    const matches = await fetchMatches();
    console.log("Matches fetched:", matches.length);
    const selections = [];
    const ids = [];
    const moneyMatches = [];

    // const nextRun = matches[matches.length - 1].scheduledTime;
    // const filteredMatches = matches.filter(match => checkMatchID(match.id));
    // console.log("Filtered Matches:", filteredMatches.length);
    // for(const match of filteredMatches) {
    //     console.log(`Match ID: ${match.id}`);
    // }

    for (const match of matches) {

        if (selections.length >= matchCount) break; // Limit to matchCount selections
        const oddsData = await getMatchOdds(match.id);
        if (!oddsData?.marketList?.length) continue;

        //only include matches that are scheduled at least 2 minutes into the future
        const matchStartTime = new Date(match.scheduledTime).getTime();
        const now = Date.now();
        const timeDifference = matchStartTime - now;

        // Skip if match starts in less than 2 minutes
        if (timeDifference < 2 * 60 * 1000) continue;

        

        // console.log(`Match ID: ${match.id}, Match Name: ${match.name}, Scheduled Time: ${new Date(match.scheduledTime).toLocaleString()}`);
        // const sureMatch = getEntryById(oddsData.shortCode);
        const sureMatch = advanceGetEntryById(oddsData.id);
        if (!sureMatch || sureMatch.type === undefined || sureMatch.type < 1 || sureMatch.type > 3) continue; // Check if sureMatch is valid


        console.log(`Match Type: ${sureMatch.type}, Match ID: ${sureMatch.id}, Match Short Code: ${sureMatch.shortCode}, Home Score: ${sureMatch.homeScore}, Away Score: ${sureMatch.awayScore}`);
        
        const date = new Date(match.scheduledTime);

        const localTime = date.toLocaleString();

        moneyMatches.push({
            sportId: match.sportId,
            eventId: match.id,
            eventName: match.name,
            scheduledTime: localTime,
        });

        await sendMatchToTelegram({
            sportId: match.sportId,
            eventId: match.id,
            eventName: match.name,
            scheduledTime: localTime,
        });

        for (const market of oddsData.marketList) {
            if (market.name === "Correct score") {
                ids.push(oddsData.id);
                for (const detail of market.markets) {
                    for (const outcome of detail.outcomes) {
                        if (outcome.id != sureMatch.type) continue; // Check if outcome ID matches the type
                        if (selections.length > 5) break; // Limit to matchCount selections
                        selections.push({
                            sportId: match.sportId,
                            eventId: match.id,
                            producer: match.producer,
                            marketId: market.id,
                            specifiers: detail.specifiers,
                            outcomeId: outcome.id,
                            amount: amount,
                            odds: outcome.odds,
                            specifierKeys: "",
                            eventName: match.name,
                            scheduledTime: match.scheduledTime,
                            marketName: market.name,
                            outcomeName: outcome.desc,
                            categoryId: match.categoryId,
                            tournamentId: match.tournamentId
                        });
                    }
                }
            }
        }
    }
    if (moneyMatches.length < 1) {
        console.log("No matches found with thoses ids. ");
    }

    return [moneyMatches, ids, selections];
}

module.exports = { correct_score };
