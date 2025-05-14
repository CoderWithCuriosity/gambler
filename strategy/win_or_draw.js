const { fetchMatches, getMatchOdds } = require('../api/matches');
const { checkId, getEntryById, advanceCheckId, advanceGetEntryById } = require('../utils/fileManager');
const fs = require('fs');
const path = '../betHistory.json';

// Ensure the file exists
if (!fs.existsSync(path)) {
    fs.writeFileSync(path, JSON.stringify([]));
}

// Load existing IDs
function loadIDs() {
    const data = fs.readFileSync(path, 'utf8');
    return JSON.parse(data);
}

// Save ID to the list
function saveID(id) {
    const ids = loadIDs();

    if (ids.includes(id)) {
        return false;
    } else {
        ids.push(id);
        fs.writeFileSync(path, JSON.stringify(ids, null, 2));
        return true;
    }
}

async function win_or_draw(amount = 100, matchCount = 9999) {
    //Using match Count to limit the number of matches to fetch
    const matches = await fetchMatches();
    console.log("Matches fetched:", matches.length);
    const selections = [];
    const ids = [];
    const moneyMatches = [];

    // const nextRun = matches[matches.length - 1].scheduledTime;

    for (const match of matches) {
        //only include matches that are scheduled at least 2 minutes into the future
        const matchStartTime = new Date(match.scheduledTime).getTime();
        const now = Date.now();
        const timeDifference = matchStartTime - now;
        
        // Skip if match starts in less than 2 minutes
        if (timeDifference < 2 * 60 * 1000) continue;

        console.log(`Match ID: ${match.id}, Match Name: ${match.name}, Match Start Time: ${match.scheduledTime}`);


        if (selections.length >= matchCount) break; // Limit to matchCount selections
        const oddsData = await getMatchOdds(match.id);
        if (!oddsData?.marketList?.length) continue;

                
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
            tournamentId: match.tournamentId,
        });

        for (const market of oddsData.marketList) {
            if (market.name === "1x2") {
                ids.push(oddsData.id);
                for (const detail of market.markets) {
                    for (const outcome of detail.outcomes) {
                        if(outcome.id != sureMatch.type) continue; // Check if outcome id matches sureMatch type
                        if (selections.length >= 20) break; // Limit to matchCount selections
                        if(!saveID(oddsData.id)) continue; // Check if ID is already saved
                        selections.push({
                            sportId: match.sportId,
                            eventId: match.id,
                            producer: match.producer,
                            marketId: market.id,
                            specifiers: "",
                            outcomeId: outcome.id,
                            amount: amount,
                            odds: outcome.odds,
                            specifierKeys: detail.specifierKeys,
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

module.exports = { win_or_draw };
