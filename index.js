const { loginToBangBet } = require('./api/auth');
const { placeBet } = require('./api/bet');
const { win_or_draw } = require('./strategy/win_or_draw');
const { getEntryById, storeId, advanceGetEntryById } = require('./utils/fileManager');
const axios = require('axios');
const BOT_TOKEN = '7299748052:AAHJKWCStrsnSg_e5YfWctTNnVQYUlNp8Hs';
const USER_ID = '6524312327';


async function sendMatchToTelegram(match, entry) {
    const baseUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  
    const message = `
  ⚽  *${match.eventName}*
  📅 *Scheduled Time:* ${match.scheduledTime}
  🏠 *Home Score:* ${entry.homeScore} 
  🛫 *Away Score:* ${entry.awayScore} 
    *Correct Score:* ${entry.homeScore}:${entry.awayScore}
    *Match ID:* ${match.eventId}
    *Tournament ID:* ${entry.tournamentId}
    *Previous Match ID:* ${entry.id}
    *Cloned Match Name:* ${entry.name}
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

async function main() {
    console.log(`[${new Date().toLocaleTimeString()}] Running main function...`);
    
    const [moneyMatches, ids, selections, tournamentIds] = await win_or_draw(100);
    
    if (selections.length) {
        for(let i = 0; i < ids.length; i++) {
            const match = moneyMatches[i];
            const id = ids[i];
            const entry = advanceGetEntryById(id, tournamentIds[i]);
            if(!entry) continue;
            await sendMatchToTelegram(match, entry);
        }
        
        const credentials = await loginToBangBet();
        if (!credentials) {
            console.log('Login failed.');
            return;
        }
        console.log("Placing combo bet on:");
        selections.forEach(sel =>
            console.log(`${sel.eventName} (${sel.outcomeName} @ ${sel.odds})`)
        );

        await placeBet(credentials.token, credentials.secretKey, selections);
    } else {
        console.log("No valid selections found");
    }
}

// Run immediately once server starts
main();

// Then set it to run every 5 minutes (5 * 60 * 1000 milliseconds)
// setInterval(main, 5 * 60 * 1000);
