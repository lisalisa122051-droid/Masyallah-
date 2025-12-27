const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');
const { getBuffer, downloadFile } = require('../lib/function.js');
const config = require('../config.js');

const commands = {
    play: {
        help: 'Download YouTube audio/video',
        category: 'Download',
        execute: async (sock, message, args) => {
            const { from } = message;
            
            if (args.length === 0) {
                const buttons = [
                    { buttonId: 'play audio', buttonText: { displayText: '🎵 AUDIO' }, type: 1 },
                    { buttonId: 'play video', buttonText: { displayText: '🎬 VIDEO' }, type: 1 }
                ];
                
                await sock.sendMessage(from, {
                    text: '🎵 *YOUTUBE DOWNLOADER*\n\nPlease select download type:',
                    footer: 'Select audio or video',
                    buttons: buttons,
                    headerType: 1
                });
                return;
            }
            
            const type = args[0].toLowerCase();
            const url = args[1];
            
            if (!url && !message.quoted?.text?.includes('youtube.com') && !message.quoted?.text?.includes('youtu.be')) {
                await sock.sendMessage(from, {
                    text: 'Please provide YouTube URL.\nExample: .play audio https://youtube.com/watch?v=...\nOr reply to a message containing YouTube link'
                });
                return;
            }
            
            const youtubeUrl = url || (message.quoted ? message.quoted.text : '');
            
            if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
                await sock.sendMessage(from, {
                    text: 'Invalid YouTube URL. Please provide a valid YouTube link.'
                });
                return;
            }
            
            try {
                await sock.sendMessage(from, { text: '⏳ Downloading... Please wait.' });
                
                if (type === 'audio') {
                    // Download as audio
                    const info = await ytdl.getInfo(youtubeUrl);
                    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
                    
                    const stream = ytdl(youtubeUrl, { 
                        filter: 'audioonly',
                        quality: 'highestaudio' 
                    });
                    
                    const chunks = [];
                    stream.on('data', chunk => chunks.push(chunk));
                    stream.on('end', async () => {
                        const buffer = Buffer.concat(chunks);
                        
                        await sock.sendMessage(from, {
                            audio: buffer,
                            mimetype: 'audio/mp4',
                            fileName: `${title}.mp3`
                        });
                    });
                    
                } else if (type === 'video') {
                    // Download as video
                    const info = await ytdl.getInfo(youtubeUrl);
                    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
                    
                    const stream = ytdl(youtubeUrl, { 
                        quality: 'highest' 
                    });
                    
                    const chunks = [];
                    stream.on('data', chunk => chunks.push(chunk));
                    stream.on('end', async () => {
                        const buffer = Buffer.concat(chunks);
                        
                        await sock.sendMessage(from, {
                            video: buffer,
                            mimetype: 'video/mp4',
                            fileName: `${title}.mp4`,
                            caption: `📹 *${title}*`
                        });
                    });
                }
            } catch (error) {
                await sock.sendMessage(from, {
                    text: `❌ Download failed: ${error.message}`
                });
            }
        }
    },
    
    ytvideo: {
        help: 'Download YouTube video',
        category: 'Download',
        execute: async (sock, message, args) => {
            const { from } = message;
            
            if (args.length === 0 && !message.quoted?.text?.includes('youtube')) {
                await sock.sendMessage(from, {
                    text: 'Please provide YouTube URL.\nExample: .ytvideo https://youtube.com/watch?v=...'
                });
                return;
            }
            
            const url = args[0] || (message.quoted ? message.quoted.text : '');
            
            try {
                await sock.sendMessage(from, { text: '⏳ Downloading video... Please wait.' });
                
                const info = await ytdl.getInfo(url);
                const title = info.videoDetails.title;
                const duration = info.videoDetails.lengthSeconds;
                
                const stream = ytdl(url, { quality: 'highest' });
                
                const chunks = [];
                stream.on('data', chunk => chunks.push(chunk));
                stream.on('end', async () => {
                    const buffer = Buffer.concat(chunks);
                    
                    await sock.sendMessage(from, {
                        video: buffer,
                        mimetype: 'video/mp4',
                        fileName: `${title}.mp4`,
                        caption: `🎬 *${title}*\n⏱️ Duration: ${Math.floor(duration / 60)}:${duration % 60}`
                    });
                });
                
            } catch (error) {
                await sock.sendMessage(from, {
                    text: `❌ Download failed: ${error.message}`
                });
            }
        }
    },
    
    tiktok: {
        help: 'Download TikTok video',
        category: 'Download',
        execute: async (sock, message, args) => {
            const { from } = message;
            
            if (args.length === 0 && !message.quoted?.text?.includes('tiktok')) {
                await sock.sendMessage(from, {
                    text: 'Please provide TikTok URL.\nExample: .tiktok https://tiktok.com/...'
                });
                return;
            }
            
            const url = args[0] || (message.quoted ? message.quoted.text : '');
            
            try {
                await sock.sendMessage(from, { text: '⏳ Downloading TikTok video...' });
                
                // Using TikTok API
                const response = await axios.get(`${config.api.tiktok}${encodeURIComponent(url)}`);
                const data = response.data;
                
                if (data.video) {
                    const buffer = await getBuffer(data.video);
                    
                    await sock.sendMessage(from, {
                        video: buffer,
                        mimetype: 'video/mp4',
                        caption: `📱 *TikTok Video*\n\n👤 ${data.author || 'Unknown'}\n❤️ ${data.like_count || 0} Likes\n📥 ${data.download_count || 0} Downloads`
                    });
                } else {
                    throw new Error('No video found');
                }
                
            } catch (error) {
                await sock.sendMessage(from, {
                    text: `❌ TikTok download failed: ${error.message}`
                });
            }
        }
    },
    
    instagram: {
        help: 'Download Instagram content',
        category: 'Download',
        execute: async (sock, message, args) => {
            const { from } = message;
            
            if (args.length === 0 && !message.quoted?.text?.includes('instagram')) {
                await sock.sendMessage(from, {
                    text: 'Please provide Instagram URL.\nExample: .instagram https://instagram.com/p/...'
                });
                return;
            }
            
            const url = args[0] || (message.quoted ? message.quoted.text : '');
            
            try {
                await sock.sendMessage(from, { text: '⏳ Downloading Instagram content...' });
                
                // Using Instagram API
                const response = await axios.post(config.api.instagram, { url });
                const data = response.data;
                
                if (data.media) {
                    if (data.media.type === 'image') {
                        const buffer = await getBuffer(data.media.url);
                        
                        await sock.sendMessage(from, {
                            image: buffer,
                            caption: `📸 *Instagram Photo*\n\n${data.caption || ''}`
                        });
                    } else if (data.media.type === 'video') {
                        const buffer = await getBuffer(data.media.url);
                        
                        await sock.sendMessage(from, {
                            video: buffer,
                            caption: `🎬 *Instagram Video*\n\n${data.caption || ''}`
                        });
                    }
                } else {
                    throw new Error('No media found');
                }
                
            } catch (error) {
                await sock.sendMessage(from, {
                    text: `❌ Instagram download failed: ${error.message}`
                });
            }
        }
    }
};

module.exports = { commands };
