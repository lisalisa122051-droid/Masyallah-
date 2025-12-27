const config = require('../config.js');
const { parsePhoneNumber } = require('libphonenumber-js');

// Extract phone number from JID
function extractPhoneFromJid(jid) {
    if (!jid) return null;
    const number = jid.split('@')[0];
    return number.replace(/[^0-9]/g, '');
}

// Normalize phone number
function normalizePhoneNumber(phone) {
    try {
        const parsed = parsePhoneNumber(phone, 'ID');
        return parsed.format('E.164').replace('+', '');
    } catch (error) {
        // If parsing fails, clean the number
        const cleaned = phone.replace(/[^0-9]/g, '');
        return cleaned.startsWith('0') ? '62' + cleaned.substring(1) : cleaned;
    }
}

// Check if JID is group
function isGroupJid(jid) {
    return jid.endsWith('@g.us');
}

// Check if user is owner
function isOwner(sender) {
    const normalizedSender = normalizePhoneNumber(sender);
    return config.owner.some(ownerNumber => {
        const normalizedOwner = normalizePhoneNumber(ownerNumber);
        return normalizedSender === normalizedOwner;
    });
}

// Map raw JID to original number
function mapRawJidToOriginalNumber(rawJid) {
    const phone = extractPhoneFromJid(rawJid);
    return normalizePhoneNumber(phone);
}

// Process JID from group message
async function processJidFromGroupMessage(sock, jid) {
    if (!isGroupJid(jid)) return [];
    
    try {
        const groupMetadata = await sock.groupMetadata(jid);
        const participants = groupMetadata.participants;
        
        return participants.map(participant => {
            return {
                jid: participant.id,
                number: mapRawJidToOriginalNumber(participant.id),
                admin: participant.admin
            };
        });
    } catch (error) {
        console.error('Error processing group JID:', error);
        return [];
    }
}

// Get group admins
async function getGroupAdmins(sock, groupJid) {
    if (!isGroupJid(groupJid)) return [];
    
    try {
        const groupMetadata = await sock.groupMetadata(groupJid);
        const participants = groupMetadata.participants;
        
        return participants
            .filter(p => p.admin)
            .map(p => mapRawJidToOriginalNumber(p.id));
    } catch (error) {
        console.error('Error getting group admins:', error);
        return [];
    }
}

// Get sender number
function getSenderNumber(message) {
    if (message.isGroup) {
        return message.sender;
    } else {
        return mapRawJidToOriginalNumber(message.from);
    }
}

module.exports = {
    extractPhoneFromJid,
    normalizePhoneNumber,
    isGroupJid,
    isOwner,
    mapRawJidToOriginalNumber,
    processJidFromGroupMessage,
    getGroupAdmins,
    getSenderNumber
};
