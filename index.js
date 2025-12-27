const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, delay } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const fs = require('fs-extra');
const path = require('path');
const P = require('pino');

const config = require('./config.js');
const handler = require('./handler.js');
const { serialize } = require('./lib/serialize.js');

// Create session directory if not exists
if (!fs.existsSync('./session')) {
    fs.mkdirSync('./session');
}

// Start bot
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
        version,
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })),
        },
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
        generateHighQualityLinkPreview: true,
        getMessage: async (key) => {
            return {
                conversation: 'message unavailable'
            };
        },
    });

    // Save credentials when updated
    sock.ev.on('creds.update', saveCreds);

    // QR Code generation
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('Scan QR Code below:');
            qrcode.generate(qr, { small: true });
        }
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed due to:', lastDisconnect?.error, ', reconnecting:', shouldReconnect);
            
            if (shouldReconnect) {
                await delay(5000);
                startBot();
            }
        } else if (connection === 'open') {
            console.log('Bot connected successfully!');
            console.log('Welcome to WhatsApp Multi-Device Bot');
        }
    });

    // Process messages
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;
        
        try {
            // Serialize message
            const serialized = await serialize(msg, sock);
            
            // Send to handler
            await handler(sock, serialized);
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    // Anti-crash
    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
        console.error('Uncaught Exception:', error);
    });

    return sock;
}

// Start the bot
startBot();
