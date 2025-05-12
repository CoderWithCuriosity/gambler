const fs = require('fs');
const path = require('path');
const { getMatchOdds } = require('../api/matches');

async function updateMatchesWithOdds(filePath) {
    const fullPath = path.resolve(filePath);
    const rawData = fs.readFileSync(fullPath);
    const matches = JSON.parse(rawData);

    for (let match of matches) {
        const oddsData = await getMatchOdds(match.id);
        if (oddsData) {
            match.name = oddsData.name;
            match.tournamentName = oddsData.tournamentName;
            match.tournamentId = oddsData.tournamentId;
            match.homeTeamName = oddsData.homeTeamName;
            match.awayTeamName = oddsData.awayTeamName;
            match.homeTeamNameAlias = oddsData.homeTeamNameAlias;
            match.awayTeamNameAlias = oddsData.awayTeamNameAlias;
        }
        console.log(`Match ID: ${match.id}`);
    }

    fs.writeFileSync(fullPath, JSON.stringify(matches, null, 2));
    console.log("Matches updated successfully.");
}

// Call the function with your file path
updateMatchesWithOdds('./ids.json');