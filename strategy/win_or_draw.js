const { fetchMatches, getMatchOdds } = require('../api/matches');
const { checkId, getEntryById, advanceCheckId, advanceGetEntryById } = require('../utils/fileManager');

async function win_or_draw(amount = 100, matchCount = 9999) {
    //Using match Count to limit the number of matches to fetch
    const matches = await fetchMatches();
    console.log("Matches fetched:", matches.length);
    const selections = [];
    const ids = [];
    const moneyMatches = [];

    // const nextRun = matches[matches.length - 1].scheduledTime;

    for (const match of matches) {

        if (selections.length >= matchCount) break; // Limit to matchCount selections
        const oddsData = await getMatchOdds(match.id);
        if (!oddsData?.marketList?.length) continue;
        
        // const sureMatch = getEntryById(oddsData.shortCode);
        const sureMatch = advanceGetEntryById(oddsData.id);
        if (!sureMatch || sureMatch.type === undefined || sureMatch.type < 1 || sureMatch.type > 3) continue; // Check if sureMatch is valid


        console.log(`Match Type: ${sureMatch.type}, Match ID: ${sureMatch.id}, Match Short Code: ${sureMatch.shortCode}, Home Score: ${sureMatch.homeScore}, Away Score: ${sureMatch.awayScore}`);
        
        moneyMatches.push({
            sportId: match.sportId,
            eventId: match.id,
            eventName: match.name,
            scheduledTime: match.scheduledTime,
        });

        for (const market of oddsData.marketList) {
            if (market.name === "1x2") {
                ids.push(oddsData.id);
                for (const detail of market.markets) {
                    for (const outcome of detail.outcomes) {
                        if (outcome.id != sureMatch.type) continue; // Check if outcome ID matches the type
                        if (selections.length >= 50) break; // Limit to matchCount selections
                        selections.push({
                            sportId: match.sportId,
                            eventId: match.id,
                            producer: match.producer,
                            marketId: market.id,
                            specifiers: "",
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

module.exports = { win_or_draw };
