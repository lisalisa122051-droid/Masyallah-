const axios = require('axios');
const config = require('../config.js');
const { pickRandom } = require('../lib/function.js');

// Jokes database
const jokes = [
    "Kenapa programmer tidak pernah mandi? Karena dia takut error: 'No water found'",
    "Apa bedanya programmer dan politikus? Programmer dibayar untuk coding, politikus dibayar untuk berbohong.",
    "Kenapa JavaScript single? Karena dia selalu promise, tapi never resolve.",
    "Apa makanan favorit programmer? Cookies dan cache.",
    "Kenapa programmer susah tidur? Karena selalu debugging mimpi buruk."
];

// Truth questions
const truths = [
    "Apa rahasia terbesar yang belum pernah kamu ceritakan kepada siapa pun?",
    "Kapan terakhir kali kamu menangis dan mengapa?",
    "Apa ketakutan terbesarmu?",
    "Siapa orang yang paling kamu sukai di grup ini?",
    "Apa kebohongan terbesar yang pernah kamu katakan kepada orang tuamu?"
];

// Dare challenges
const dares = [
    "Kirim pesan 'Aku sayang kamu' ke kontak terakhir di WhatsApp kamu",
    "Ganti foto profil WhatsApp dengan foto bayi selama 1 jam",
    "Telepon orang random dan nyanyikan lagu selamat ulang tahun",
    "Kirim voice note menyanyikan lagu daerah selama 30 detik",
    "Posting status WhatsApp dengan tulisan 'Aku lagi kangen mantan'"
];

const commands = {
    joke: {
        help: 'Get random joke',
        category: 'Fun',
        execute: async (sock, message) => {
            const { from } = message;
            
            try {
                // Try API first
                const response = await axios.get(config.api.joke);
                const joke = response.data;
                
                let jokeText = '';
                if (joke.type === 'single') {
                    jokeText = joke.joke;
                } else if (joke.type === 'twopart') {
                    jokeText = `${joke.setup}\n\n${joke.delivery}`;
                } else {
                    jokeText = pickRandom(jokes);
                }
                
                await sock.sendMessage(from, { text: `😂 *JOKE*\n\n${jokeText}` });
            } catch (error) {
                // Fallback to local jokes
                const jokeText = pickRandom(jokes);
                await sock.sendMessage(from, { text: `😂 *JOKE*\n\n${jokeText}` });
            }
        }
    },
    
    tebakgambar: {
        help: 'Image guessing game',
        category: 'Fun',
        execute: async (sock, message) => {
            const { from } = message;
            
            const games = [
                {
                    question: "Ini gambar apa? 🏠",
                    answer: "rumah",
                    hint: "Tempat tinggal"
                },
                {
                    question: "Ini gambar apa? 🌞",
                    answer: "matahari",
                    hint: "Sumber cahaya"
                },
                {
                    question: "Ini gambar apa? 🚗",
                    answer: "mobil",
                    hint: "Kendaraan"
                }
            ];
            
            const game = pickRandom(games);
            
            await sock.sendMessage(from, {
                text: `🎮 *TEBAK GAMBAR*\n\n${game.question}\n\n💡 Hint: ${game.hint}\n\nJawab dengan: .jawab <tebakan>`
            });
            
            // Store game state (simplified)
            // In real implementation, use database to store game state
        }
    },
    
    truth: {
        help: 'Get random truth question',
        category: 'Fun',
        execute: async (sock, message) => {
            const { from } = message;
            
            try {
                const response = await axios.get(config.api.truth);
                const truth = response.data.question;
                await sock.sendMessage(from, { text: `📝 *TRUTH*\n\n${truth}` });
            } catch (error) {
                const truth = pickRandom(truths);
                await sock.sendMessage(from, { text: `📝 *TRUTH*\n\n${truth}` });
            }
        }
    },
    
    dare: {
        help: 'Get random dare challenge',
        category: 'Fun',
        execute: async (sock, message) => {
            const { from } = message;
            
            try {
                const response = await axios.get(config.api.dare);
                const dare = response.data.question;
                await sock.sendMessage(from, { text: `🔥 *DARE*\n\n${dare}` });
            } catch (error) {
                const dare = pickRandom(dares);
                await sock.sendMessage(from, { text: `🔥 *DARE*\n\n${dare}` });
            }
        }
    },
    
    rate: {
        help: 'Rate something from 1-100',
        category: 'Fun',
        execute: async (sock, message, args) => {
            const { from, pushName } = message;
            
            if (args.length === 0) {
                // Rate the user
                const rating = Math.floor(Math.random() * 100) + 1;
                let comment = '';
                
                if (rating >= 90) comment = 'Perfect! 😍';
                else if (rating >= 70) comment = 'Great! 😊';
                else if (rating >= 50) comment = 'Not bad! 😄';
                else if (rating >= 30) comment = 'Could be better 😅';
                else comment = 'Needs improvement 😬';
                
                await sock.sendMessage(from, {
                    text: `⭐ *RATING*\n\n*${pushName}*\n\nScore: ${rating}/100\n\n${comment}`
                });
            } else {
                // Rate something else
                const thing = args.join(' ');
                const rating = Math.floor(Math.random() * 100) + 1;
                
                await sock.sendMessage(from, {
                    text: `⭐ *RATING*\n\n*${thing}*\n\nScore: ${rating}/100\n\n${rating >= 50 ? '👍 Recommended' : '👎 Not recommended'}`
                });
            }
        }
    }
};

module.exports = { commands };
