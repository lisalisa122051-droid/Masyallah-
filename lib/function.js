/**
 * lib/function.js
 * Helper functions to send messages (buttons, lists, text) using Baileys native formats
 */

const { proto } = require('@adiwajshing/baileys');
const { jidUtils } = require('./jidUtils');

/**
 * sendText
 * @param {object} sock
 * @param {string} chatId raw jid (group or individual)
 * @param {string} text
 */
async function sendText(sock, chatId, text) {
  await sock.sendMessage(chatId, { text });
}

/**
 * sendButtonMessage
 * Uses native buttons (3 buttons max)
 * @param {object} sock
 * @param {string} chatId
 * @param {string} text
 * @param {string} footer
 * @param {Array} buttons [{id, title}]
 */
async function sendButtonMessage(sock, chatId, text, footer = '', buttons = []) {
  const buttonMessage = {
    text,
    footer,
    buttons: buttons.map(b => ({ buttonId: b.id, buttonText: { displayText: b.title }, type: 1 })),
    headerType: 1
  };
  await sock.sendMessage(chatId, buttonMessage);
}

/**
 * sendListMessage
 * Uses native list message
 * @param {object} sock
 * @param {string} chatId
 * @param {string} title
 * @param {string} description
 * @param {string} buttonText
 * @param {Array} sections [{title, rows:[{id, title, description}]}]
 * @param {string} footer
 */
async function sendListMessage(sock, chatId, title, description, buttonText, sections = [], footer = '') {
  const listMessage = {
    text: description,
    footer,
    title,
    buttonText,
    sections
  };
  await sock.sendMessage(chatId, listMessage);
}

module.exports = { sendText, sendButtonMessage, sendListMessage };
