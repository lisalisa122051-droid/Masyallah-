const { proto, getContentType } = require('@whiskeysockets/baileys');
const { normalizePhoneNumber, isGroupJid } = require('./jidUtils.js');

// Anti-spam system
const spamCache = {};
function antiSpam(sender, cooldown = 3000) {
    const now = Date.now();
    if (spamCache[sender] && now - spamCache[sender] < cooldown) {
        return true;
    }
    spamCache[sender] = now;
    return false;
}

// Serialize message
function serialize(client, message) {
    if (!message || !message.key) return null;
    
    const m = { ...message };
    m.from = m.key.remoteJid;
    m.isGroup = isGroupJid(m.from);
    m.sender = normalizePhoneNumber(m.isGroup ? m.key.participant : m.key.remoteJid);
    m.body = '';
    
    // Extract text from message
    try {
        const msgType = getContentType(m.message);
        if (msgType === 'conversation') {
            m.body = m.message?.conversation || '';
        } else if (msgType === 'extendedTextMessage') {
            m.body = m.message?.extendedTextMessage?.text || '';
        } else if (msgType === 'imageMessage') {
            m.body = m.message?.imageMessage?.caption || '';
        } else if (msgType === 'videoMessage') {
            m.body = m.message?.videoMessage?.caption || '';
        } else if (msgType === 'buttonsResponseMessage') {
            m.body = m.message?.buttonsResponseMessage?.selectedButtonId || '';
        } else if (msgType === 'listResponseMessage') {
            m.body = m.message?.listResponseMessage?.singleSelectReply?.selectedRowId || '';
        }
    } catch (e) {
        m.body = '';
    }
    
    // Reply function
    m.reply = async (text, options = {}) => {
        return client.sendMessage(m.from, { text, ...options }, { quoted: m });
    };
    
    // Send message function
    m.send = async (content, options = {}) => {
        return client.sendMessage(m.from, content, { quoted: m, ...options });
    };
    
    // Check if sender is admin in group
    if (m.isGroup) {
        try {
            const metadata = client.groupMetadata(m.from).then(g => {
                m.isBotAdmin = g.participants.find(p => p.id === client.user.id)?.admin !== undefined;
                m.isAdmin = g.participants.find(p => p.id === (m.key.participant || m.sender + '@s.whatsapp.net'))?.admin !== undefined;
            }).catch(() => {
                m.isBotAdmin = false;
                m.isAdmin = false;
            });
        } catch {
            m.isBotAdmin = false;
            m.isAdmin = false;
        }
    } else {
        m.isBotAdmin = false;
        m.isAdmin = false;
    }
    
    return m;
}

module.exports = { serialize, antiSpam };
