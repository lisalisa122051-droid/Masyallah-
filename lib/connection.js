/**
 * lib/connection.js
 * Handles Baileys connection and session management
 */

const makeWASocket = require('@im-dims/baileys-md').default || require('@im-dims/baileys-md');
const { useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require('@im-dims/baileys-md');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const config = require('../config');

const logger = pino({ level: 'silent' });

async function startConnection(handler) {
  // create session folder if not exists
  if (!fs.existsSync(config.sessionPath)) fs.mkdirSync(config.sessionPath, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(config.sessionPath);

  const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 2204, 13] }));

  const sock = makeWASocket({
    logger,
    printQRInTerminal: true,
    auth: state,
    version
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      qrcode.generate(qr, { small: true });
      console.log('QR code generated, scan with WhatsApp Multi-Device');
    }
    if (connection === 'close') {
      const reason = (lastDisconnect && lastDisconnect.error && lastDisconnect.error.output) ? lastDisconnect.error.output.statusCode : null;
      console.log('Connection closed', reason);
      // try reconnect
      if (lastDisconnect && lastDisconnect.error && lastDisconnect.error.output && lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
        startConnection(handler);
      } else {
        console.log('Logged out. Remove session and restart.');
      }
    } else if (connection === 'open') {
      console.log('Connected to WhatsApp');
    }
  });

  // save creds on update
  sock.ev.on('creds.update', saveCreds);

  // pass socket and event emitter to handler
  await handler(sock, sock.ev);

  return { sock, ev: sock.ev };
}

module.exports = { startConnection };
