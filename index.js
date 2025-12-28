const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, generateForwardMessageContent, prepareWAMessageMedia, generateWAMessageFromContent, generateMessageID, downloadContentFromMessage, getAggregateVotesInPollMessage, proto } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const P = require('pino');

// Config
const config = require('./config.js');

// Libs
const { serialize, antiSpam } = require('./lib/serialize.js');
const { isGroupJid, extractPhoneFromJid, normalizePhoneNumber, mapRawJidToOriginalNumber, processJidFromGroupMessage, isOwner } = require('./lib/jidUtils.js');
const { saveDatabase, loadDatabase } = require('./lib/database.js');
const { color } = require('./lib/function.js');

// Handler
const handler = require('./handler.js');

// Session directory
const sessionDir = path.join(__dirname, 'session');
if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);

// Global variable
global.db = loadDatabase();
global.owner = config.owner;
global.botName = config.botName;
global.prefix = config.prefix;

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version, isLatest } = await fetchLatestBaileysVersion();

    const client = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
        auth: state,
        version
    });

    client.ev.on('creds.update', saveCreds);

    client.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) qrcode.generate(qr, { small: true });
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log(color('Connection lost, reconnecting...', 'yellow'));
                startBot();
            } else {
                console.log(color('Logged out, please scan QR again.', 'red'));
            }
        } else if (connection === 'open') {
            console.log(color('Connected successfully!', 'green'));
            // Auto save database every 5 minutes
            cron.schedule('*/5 * * * *', () => {
                saveDatabase(global.db);
                console.log(color('Database auto-saved.', 'cyan'));
            });
        }
    });

    client.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.remoteJid === 'status@broadcast' || msg.key.fromMe) return;

        // Serialize message
        const serialized = serialize(client, msg);
        if (!serialized) return;

        // Anti spam
        if (antiSpam(serialized.sender, 3000)) return;

        // Process command
        await handler(client, serialized);
    });

    // Handle group updates
    client.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;
        const metadata = await client.groupMetadata(id);
        const groupName = metadata.subject;
        const welcomeStatus = global.db.groups?.[id]?.welcome || false;
        
        if (welcomeStatus && action === 'add') {
            const text = `Welcome @${participants[0].split('@')[0]} to *${groupName}*!\nPlease read group rules.`;
            const mentions = participants.map(p => p);
            await client.sendMessage(id, { text, mentions });
        }
    });

    // Handle incoming call
    client.ev.on('call', async (call) => {
        await client.sendMessage(call.from, { text: 'Sorry, I cannot receive calls.' });
    });

    // Save database on exit
    process.on('SIGINT', () => {
        saveDatabase(global.db);
        console.log(color('Database saved before exit.', 'cyan'));
        process.exit(0);
    });

    return client;
}

startBot();
