const axios = require('axios');
const { generateRSignature } = require('../utils/hash');
const { deviceId } = require('../config');

async function placeBet(token, secretKey, selections, amount = 100) {
    const payload = {
        betType: 1,
        couponId: 0,
        items: selections.map(item => ({ ...item, amount: 0 })),
        amount: amount,
        payAmount: amount,
        exciseTax: 0,
        channel: "H5",
        shareBy: null,
        bets: [{
            outcomeNum: selections.length,
            num: 1,
            amount: amount
        }],
        accept: 1,
        device: deviceId
    };

    const { r, time } = generateRSignature(payload, token, secretKey);

    try {
        const res = await axios.post("https://bet-api.bangbet.com/api/bet/order/bet", payload, {
            headers: {
                "Content-Type": "application/json",
                "R": r,
                "Token": token,
                "Time": time
            }
        });

        console.log("✅ Bet Result:", res.data);
    } catch (err) {
        console.error("❌ Error placing bet:", err.response?.data || err.message);
    }
}

module.exports = { placeBet };
