const { proto, getContentType } = require('@whiskeysockets/baileys');
const config = require('../config.js');
const { isGroupJid, normalizePhoneNumber, getSenderNumber, isOwner } = require('./jidUtils.js');
const db = require('./database.js');

async function serialize(msg, sock) {
    try {
        const m = msg;
        if (!m.message) return null;
        
        // Basic message info
        const from = m.key.remoteJid;
        const isGroup = isGroupJid(from);
        const sender = isGroup ? m.key.participant : from;
        const normalizedSender = normalizePhoneNumber(sender);
        
        // Extract message content
        let type = Object.keys(m.message)[0];
        let body = '';
        let quoted = null;
        
        // Text message
        if (type === 'conversation') {
            body = m.message.conversation;
        }
        // Extended text message
        else if (type === 'extendedTextMessage') {
            body = m.message.extendedTextMessage.text || '';
            quoted = m.message.extendedTextMessage.contextInfo?.quotedMessage;
        }
        // Image/Video with caption
        else if (type === 'imageMessage' || type === 'videoMessage') {
            body = m.message[type]?.caption || '';
        }
        
        // Clean body
        body = (body || '').trim();
        
        // Check if it's a command
        let isCmd = false;
        let command = '';
        let args = [];
        
        if (body) {
            const prefix = config.prefix.find(p => body.startsWith(p));
            if (prefix) {
                isCmd = true;
                const cmdText = body.slice(prefix.length).trim();
                const split = cmdText.split(' ');
                command = split[0].toLowerCase();
                args = split.slice(1);
            }
        }
        
        // Update command stats
        if (isCmd) {
            db.incrementCommand(normalizedSender);
        }
        
        // Get user info
        const pushName = m.pushName || 'User';
        
        // Serialize quoted message
        let quotedMsg = null;
        if (quoted) {
            quotedMsg = {
                sender: quoted.participant,
                text: quoted.conversation || quoted.extendedTextMessage?.text || '',
                type: getContentType(quoted)
            };
        }
        
        return {
            from,
            sender: normalizedSender,
            pushName,
            body,
            type,
            isGroup,
            isOwner: isOwner(normalizedSender),
            isCmd,
            command,
            args,
            quoted: quotedMsg,
            message: m,
            timestamp: m.messageTimestamp,
            reply: async (text, options = {}) => {
                return await sock.sendMessage(from, { text, ...options }, { quoted: m });
            }
        };
        
    } catch (error) {
        console.error('Serialize error:', error);
        return null;
    }
}

module.exports = { serialize };
