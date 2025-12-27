/**
 * lib/serialize.js
 * Convert raw Baileys message into normalized structure used by the bot
 *
 * - sender: normalized phone number (e.g., 6281234)
 * - senderJid: raw jid of sender
 * - chatId: raw chat jid (group or individual)
 * - isGroup: boolean
 * - text: message text
 * - id: message id
 * - isSelf: whether message is from the bot itself
 * - groupMetadata: if group, include metadata (participants, admins)
 */

const { jidUtils } = require('./jidUtils');
const { readDB } = require('./database');

module.exports = async function serialize(raw, sock) {
  try {
    const message = raw.message;
    const key = raw.key || {};
    const chatId = key.remoteJid;
    const isGroup = jidUtils.isGroupJid(chatId);
    const fromMe = key.fromMe || false;
    const senderJid = key.participant || key.remoteJid;
    const sender = jidUtils.extractPhoneFromJid(senderJid) || jidUtils.normalizePhoneNumber(senderJid);

    // get text content
    let text = '';
    if (message.conversation) text = message.conversation;
    else if (message.extendedTextMessage && message.extendedTextMessage.text) text = message.extendedTextMessage.text;
    else if (message.imageMessage && message.imageMessage.caption) text = message.imageMessage.caption;
    else if (message.videoMessage && message.videoMessage.caption) text = message.videoMessage.caption;
    else if (message.buttonsResponseMessage && message.buttonsResponseMessage.selectedButtonId) text = message.buttonsResponseMessage.selectedButtonId;
    else if (message.listResponseMessage && message.listResponseMessage.singleSelectReply && message.listResponseMessage.singleSelectReply.selectedRowId) text = message.listResponseMessage.singleSelectReply.selectedRowId;

    // group metadata mapping
    let groupMetadata = null;
    if (isGroup) {
      try {
        groupMetadata = await sock.groupMetadata(chatId);
        // normalize participants and admins
        const participants = (groupMetadata.participants || []).map(p => {
          const num = jidUtils.extractPhoneFromJid(p.id || p);
          return { id: p.id || p, number: num, isAdmin: (p.isAdmin || p.isSuperAdmin) || false };
        });
        const admins = participants.filter(p => p.isAdmin).map(p => p.number);
        groupMetadata = {
          id: groupMetadata.id,
          subject: groupMetadata.subject,
          participants: participants,
          admins
        };
      } catch (e) {
        groupMetadata = null;
      }
    }

    return {
      id: key.id,
      chatId,
      senderJid,
      sender,
      isGroup,
      isSelf: fromMe,
      text,
      message,
      groupMetadata
    };
  } catch (err) {
    console.error('serialize error', err);
    return null;
  }
};
