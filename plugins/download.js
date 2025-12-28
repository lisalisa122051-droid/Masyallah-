const axios = require('axios');
const ytdl = require('ytdl-core');
const { getRandom } = require('../lib/function.js');

module.exports = {
    commands: ['play', 'ytvideo', 'tiktok', 'instagram'],
    description: 'Download media',
    
    execute: async (client, m, args, text) => {
        const { reply } = m;
        
        if (m.body.includes('play')) {
            if (!text) return reply('Provide search query (e.g., .play baby shark)');
            
            // Button selector for audio/video
            const buttons = [
                { buttonId: `${global.prefix}ytaudio ${text}`, buttonText: { displayText: '🎵 AUDIO' }, type: 1 },
                { buttonId: `${global.prefix}ytvideo ${text}`, buttonText: { displayText: '🎬 VIDEO' }, type: 1 }
            ];
            
            const buttonMessage = {
                text: `*DOWNLOAD OPTIONS*\n\nQuery: *${text}*\n\nSelect format:`,
                footer: 'Powered by YouTube',
                buttons: buttons,
                headerType: 1
            };
            
            return client.sendMessage(m.from, buttonMessage);
        } else if (m.body.includes('ytvideo')) {
            if (!text) return reply('Provide YouTube URL or search query.');
            await reply('*Processing YouTube video...*');
            // Implementation would require YouTube API
            await reply('YouTube download feature requires API key. Set it in config.js');
        } else if (m.body.includes('tiktok')) {
            if (!text) return reply('Provide TikTok URL.');
            await reply('*Downloading TikTok...*');
            try {
                // This would require TikTok API
                await reply('TikTok download feature under development!');
            } catch (error) {
                await reply('Failed to download TikTok.');
            }
        } else if (m.body.includes('instagram')) {
            if (!text) return reply('Provide Instagram URL.');
            await reply('*Downloading Instagram...*');
            try {
                // This would require Instagram API
                await reply('Instagram download feature under development!');
            } catch (error) {
                await reply('Failed to download Instagram.');
            }
        }
    }
};
