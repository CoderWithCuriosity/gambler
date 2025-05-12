const axios = require('axios');

function getTomorrowTimestamps() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const beginTime = tomorrow.getTime();

    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);
    const endTime = endOfTomorrow.getTime();

    return { beginTime, endTime };
}

async function fetchMatches() {
    // const { beginTime, endTime } = getTomorrowTimestamps();

    const payload = {
        sportId: "sr:sport:1",
        country: "ng",
        dataGroup: false,
        groupIndex: "0",
        highLight: false,
        isMyTeam: false,
        page: 1,
        pageNo: 1,
        pageSize: 9999,
        position: 17,
        producer: 6,
        showMarket: true,
        sortType: 1,
        specialMarketMatch: false,
        timeZone: "+1"
    };

    try {
        const res = await axios.post("https://bet-api.bangbet.com/api/bet/match/list", payload, {
            headers: { "Content-Type": "application/json" }
        });

        return res.data?.data?.data || [];
    } catch (err) {
        console.error("Error fetching matches:", err.message);
        return [];
    }
}

async function getMatchOdds(matchId) {
    const payload = {
        sportId: "sr:sport:1",
        matchId,
        producer: 6,
        position: 16,
        country: "ng"
    };

    try {
        const res = await axios.post("https://bet-api.bangbet.com/api/bet/match/odds", payload, {
            headers: { "Content-Type": "application/json" }
        });

        return res.data?.data || null;
    } catch (err) {
        console.error(`Error fetching odds for match ${matchId}:`, err.message);
        return null;
    }
}

module.exports = { fetchMatches, getMatchOdds };
