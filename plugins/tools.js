const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const axios = require('axios');
const FormData = require('form-data');
const { getBuffer, downloadFile } = require('../lib/function.js');
const config = require('../config.js');

const execAsync = promisify(exec);

const commands = {
    sticker: {
        help: 'Create sticker from image/video',
        category: 'Tools',
        execute: async (sock, message) => {
            const { from, quoted, type } = message;
            
            // Check if message contains media or quoted message contains media
            const isImage = type === 'imageMessage' || quoted?.type === 'imageMessage';
            const isVideo = type === 'videoMessage' || quoted?.type === 'videoMessage';
            
            if (!isImage && !isVideo) {
                await sock.sendMessage(from, {
                    text: 'Please send or reply to an image/video to create sticker.\n\nNote: Video must be less than 10 seconds.'
                });
                return;
            }
            
            try {
                await sock.sendMessage(from, { text: '⏳ Creating sticker...' });
                
                let mediaBuffer;
                
                if (isImage) {
                    // Download image
                    const media = message.message?.imageMessage || quoted?.message?.imageMessage;
                    mediaBuffer = await sock.downloadMediaMessage(media);
                } else if (isVideo) {
                    // Download video
                    const media = message.message?.videoMessage || quoted?.message?.videoMessage;
                    mediaBuffer = await sock.downloadMediaMessage(media);
                }
                
                if (!mediaBuffer) {
                    throw new Error('Failed to download media');
                }
                
                // Convert to sticker
                await sock.sendMessage(from, {
                    sticker: mediaBuffer,
                    mimetype: isImage ? 'image/webp' : 'video/webp'
                });
                
            } catch (error) {
                await sock.sendMessage(from, {
                    text: `❌ Failed to create sticker: ${error.message}`
                });
            }
        }
    },
    
    toimg: {
        help: 'Convert sticker to image',
        category: 'Tools',
        execute: async (sock, message) => {
            const { from, quoted, type } = message;
            
            const isSticker = type === 'stickerMessage' || quoted?.type === 'stickerMessage';
            
            if (!isSticker) {
                await sock.sendMessage(from, {
                    text: 'Please send or reply to a sticker to convert to image.'
                });
                return;
            }
            
            try {
                await sock.sendMessage(from, { text: '⏳ Converting sticker to image...' });
                
                const media = message.message?.stickerMessage || quoted?.message?.stickerMessage;
                const mediaBuffer = await sock.downloadMediaMessage(media);
                
                if (!mediaBuffer) {
                    throw new Error('Failed to download sticker');
                }
                
                await sock.sendMessage(from, {
                    image: mediaBuffer,
                    mimetype: 'image/png'
                });
                
            } catch (error) {
                await sock.sendMessage(from, {
                    text: `❌ Failed to convert: ${error.message}`
                });
            }
        }
    },
    
    toaudio: {
        help: 'Convert video to audio',
        category: 'Tools',
        execute: async (sock, message) => {
            const { from, quoted, type } = message;
            
            const isVideo = type === 'videoMessage' || quoted?.type === 'videoMessage';
            
            if (!isVideo) {
                await sock.sendMessage(from, {
                    text: 'Please send or reply to a video to convert to audio.'
                });
                return;
            }
            
            try {
                await sock.sendMessage(from, { text: '⏳ Converting video to audio...' });
                
                const media = message.message?.videoMessage || quoted?.message?.videoMessage;
                const mediaBuffer = await sock.downloadMediaMessage(media);
                
                if (!mediaBuffer) {
                    throw new Error('Failed to download video');
                }
                
                // Save buffer to temp file
                const tempInput = path.join(__dirname, '../temp_video.mp4');
                const tempOutput = path.join(__dirname, '../temp_audio.mp3');
                
                fs.writeFileSync(tempInput, mediaBuffer);
                
                // Convert using ffmpeg
                await execAsync(`ffmpeg -i "${tempInput}" -vn -ar 44100 -ac 2 -ab 192k -f mp3 "${tempOutput}"`);
                
                const audioBuffer = fs.readFileSync(tempOutput);
                
                await sock.sendMessage(from, {
                    audio: audioBuffer,
                    mimetype: 'audio/mpeg',
                    fileName: 'audio.mp3'
                });
                
                // Clean up temp files
                fs.unlinkSync(tempInput);
                fs.unlinkSync(tempOutput);
                
            } catch (error) {
                await sock.sendMessage(from, {
                    text: `❌ Failed to convert: ${error.message}\n\nMake sure ffmpeg is installed.`
                });
            }
        }
    },
    
    shortlink: {
        help: 'Shorten URL',
        category: 'Tools',
        execute: async (sock, message, args) => {
            const { from, quoted } = message;
            
            let url = args[0] || (quoted ? quoted.text : '');
            
            if (!url) {
                await sock.sendMessage(from, {
                    text: 'Please provide URL to shorten.\nExample: .shortlink https://example.com'
                });
                return;
            }
            
            // Add http:// if missing
            if (!url.startsWith('http')) {
                url = 'https://' + url;
            }
            
            try {
                await sock.sendMessage(from, { text: '⏳ Shortening URL...' });
                
                const response = await axios.get(`${config.api.shortlink}?url=${encodeURIComponent(url)}`);
                const shortUrl = response.data;
                
                await sock.sendMessage(from, {
                    text: `🔗 *SHORTENED URL*\n\n📌 Original: ${url}\n🔗 Short: ${shortUrl}\n\nClick the link to copy.`
                });
                
            } catch (error) {
                await sock.sendMessage(from, {
                    text: `❌ Failed to shorten URL: ${error.message}`
                });
            }
        }
    }
};

module.exports = { commands };
