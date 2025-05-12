const { fetchMatches, getMatchOdds } = require('../api/matches');
const { checkId, getEntryById, advanceCheckId, advanceGetEntryById } = require('../utils/fileManager');


function formatUnixTimestamp(unix) {
    const date = new Date(unix * 1000); // Convert seconds to milliseconds
    return date.toLocaleString(); // Returns something like: "4/4/2024, 3:45:23 PM"
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

        if (selections.length >= matchCount) break; // Limit to matchCount selections
        const oddsData = await getMatchOdds(match.id);
        if (!oddsData?.marketList?.length) continue;

        ids.push(oddsData.shortCode);

        // if (!checkId(oddsData.shortCode)) continue; // Check if ID doesnt exists
        if(!advanceCheckId(oddsData.shortCode, oddsData.tournamentId)) continue; // Check if ID is already in the list

        // const sureMatch = getEntryById(oddsData.shortCode);
        const sureMatch = advanceGetEntryById(oddsData.shortCode);
        console.log(`Match Type: ${sureMatch.type}, Match ID: ${sureMatch.id}, Match Short Code: ${sureMatch.shortCode}, Home Score: ${sureMatch.homeScore}, Away Score: ${sureMatch.awayScore}`);

        if(sureMatch.type == undefined || sureMatch.type < 1 || sureMatch.type > 3) continue; // Check if type is valid

        
        for (const market of oddsData.marketList) {

            moneyMatches.push({
                sportId: match.sportId,
                eventId: match.id,
                eventName: match.name,
                scheduledTime: formatUnixTimestamp(match.scheduledTime),
                marketName: market.name,
            });

            if (market.name === "1x2") {
                for (const detail of market.markets) {
                    for (const outcome of detail.outcomes) {
                        console.log("Outcome ID:", outcome.id);
                        console.log("Sure Match Type:", sureMatch.type);
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
