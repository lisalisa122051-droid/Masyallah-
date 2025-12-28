// Serialize message untuk handler yang mudah
const { isGroup, normalizeJid } = require('./jidUtils');

const serialize = (sock, m) => {
    const msg = m.messages[0];
    if (!msg) return null;

    return {
        key: msg.key,
        message: msg.message,
        fromMe: msg.key.fromMe,
        from: normalizeJid(msg.key.remoteJid),
        sender: normalizeJid(msg.key.participant || msg.key.remoteJid),
        isGroup: isGroup(msg.key.remoteJid),
        body: (msg.message?.conversation || 
               msg.message?.extendedTextMessage?.text || 
               '').toLowerCase().trim(),
        quoted: msg.message?.extendedTextMessage?.contextInfo?.quotedMessage ? {
            key: msg.message.extendedTextMessage.contextInfo.quotedMessage
        } : null,
        pushName: msg.pushName || 'Unknown'
    };
};

module.exports = { serialize };
