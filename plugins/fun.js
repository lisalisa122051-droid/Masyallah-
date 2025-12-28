const axios = require('axios');
const { getRandom } = require('../lib/function.js');

module.exports = {
    commands: ['joke', 'tebakgambar', 'truth', 'dare', 'rate'],
    description: 'Fun commands',
    
    execute: async (client, m, args, text) => {
        const { reply, sender } = m;
        
        if (m.body.includes('joke')) {
            const jokes = [
                "Why don't scientists trust atoms? Because they make up everything!",
                "Why did the scarecrow win an award? He was outstanding in his field!",
                "What do you call fake spaghetti? An impasta!",
                "Why don't eggs tell jokes? They'd crack each other up!",
                "What do you call a bear with no teeth? A gummy bear!"
            ];
            await reply(getRandom(jokes));
        } else if (m.body.includes('truth')) {
            const truths = [
                "What's your biggest fear?",
                "Have you ever cheated on a test?",
                "What's the most embarrassing thing you've done?",
                "What's your secret talent?",
                "What's the worst lie you've told?"
            ];
            await reply(`*TRUTH:* ${getRandom(truths)}`);
        } else if (m.body.includes('dare')) {
            const dares = [
                "Do 10 pushups right now!",
                "Send a silly selfie to the group.",
                "Sing a song for 30 seconds.",
                "Talk in an accent for the next 5 minutes.",
                "Dance without music for 1 minute."
            ];
            await reply(`*DARE:* ${getRandom(dares)}`);
        } else if (m.body.includes('rate')) {
            const target = text || `@${sender.split('@')[0]}`;
            const rate = Math.floor(Math.random() * 101);
            await reply(`I rate *${target}* ${rate}/100! ${rate > 80 ? '🔥' : rate > 50 ? '👍' : '😅'}`);
        } else if (m.body.includes('tebakgambar')) {
            // This would require an API, placeholder
            await reply('Feature under development!');
        }
    }
};
