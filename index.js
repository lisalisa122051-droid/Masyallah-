// Entry point utama bot
require('qrcode-terminal');
const { Boom } = require('@hapi/boom');
const makeWASocket = require('@whiskeysockets/baileys').default;
const pino = require('pino');

const config = require('./config');
const { connection } = require('./lib/connection');
const { loadPlugins } = require('./handler');

// Logger
const logger = pino({ level: 'silent' });

// Inisialisasi koneksi
async function startBot() {
    const sock = makeWASocket({
        logger,
        printQRInTerminal: config.qr.showInTerminal,
        auth: connection.useMultiFileAuthState(config.session.folder),
        browser: ['EduBot', 'Chrome', '1.0.0']
    });

    // Event handler koneksi
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('Scan QR Code di atas!');
        }
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== 401;
            console.log('Koneksi terputus:', lastDisconnect?.error, 'Reconnect:', shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log(`${config.bot.name} siap digunakan!`);
            await loadPlugins(sock); // Load semua plugin
        }
    });

    return sock;
}

// Jalankan bot
startBot().catch(console.error);
