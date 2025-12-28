const config = require('../config.js');

// Check if JID is group
function isGroupJid(jid) {
    return jid.endsWith('@g.us');
}

// Extract phone number from JID
function extractPhoneFromJid(jid) {
    if (!jid) return null;
    return jid.split('@')[0];
}

// Normalize phone number (remove +, 0, etc)
function normalizePhoneNumber(number) {
    if (!number) return null;
    let num = number.replace(/\D/g, '');
    if (num.startsWith('0')) num = '62' + num.slice(1);
    if (num.startsWith('62')) num = '62' + num.slice(2);
    if (!num.startsWith('62')) num = '62' + num;
    return num;
}

// Map raw JID to original number
function mapRawJidToOriginalNumber(jid) {
    const raw = extractPhoneFromJid(jid);
    return normalizePhoneNumber(raw);
}

// Process JID from group message
async function processJidFromGroupMessage(client, jid) {
    try {
        const metadata = await client.groupMetadata(jid);
        const participants = metadata.participants.map(p => p.id);
        return participants.map(p => mapRawJidToOriginalNumber(p));
    } catch {
        return [];
    }
}

// Check if sender is owner
function isOwner(sender) {
    const normalizedSender = normalizePhoneNumber(sender);
    return config.owner.map(o => normalizePhoneNumber(o)).includes(normalizedSender);
}

module.exports = {
    isGroupJid,
    extractPhoneFromJid,
    normalizePhoneNumber,
    mapRawJidToOriginalNumber,
    processJidFromGroupMessage,
    isOwner
};
