const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const axios = require('axios');
const { isUrl } = require('../lib/function.js');

module.exports = {
    commands: ['sticker', 'toimg', 'toaudio', 'shortlink'],
    description: 'Tool commands',
    
    execute: async (client, m, args, text) => {
        const { reply } = m;
        
        if (m.body.includes('sticker')) {
            if (!m.message?.imageMessage && !m.message?.videoMessage) {
                return reply('Send/reply to an image or video with caption .sticker');
            }
            await reply('*Converting to sticker...*');
            
            try {
                const media = await client.downloadMediaMessage(m);
                const stickerPath = path.join(__dirname, '../temp/sticker.webp');
                fs.writeFileSync(stickerPath, media);
                
                await client.sendMessage(m.from, {
                    sticker: fs.readFileSync(stickerPath)
                }, { quoted: m });
                
                fs.unlinkSync(stickerPath);
            } catch (error) {
                await reply('Failed to create sticker.');
            }
        } else if (m.body.includes('toimg')) {
            if (!m.message?.stickerMessage) {
                return reply('Reply to a sticker with caption .toimg');
            }
            await reply('*Converting to image...*');
            // Implementation would require converting webp to png
            await reply('Feature under development!');
        } else if (m.body.includes('toaudio')) {
            if (!m.message?.videoMessage) {
                return reply('Reply to a video with caption .toaudio');
            }
            await reply('*Extracting audio...*');
            // Implementation would require ffmpeg
            await reply('Feature under development!');
        } else if (m.body.includes('shortlink')) {
            if (!text || !isUrl(text)) return reply('Provide a valid URL.');
            await reply('*Shortening URL...*');
            try {
                const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(text)}`);
                await reply(`*Shortened URL:* ${response.data}`);
            } catch {
                await reply('Failed to shorten URL.');
            }
        }
    }
};
