/**
 * lib/jidUtils.js
 * JID normalization and mapping utilities
 *
 * Important: All functions operate on normalized phone numbers (e.g., 6281234567890)
 * and raw JIDs only when necessary. Avoid using raw JIDs directly in plugins.
 */

const config = require('../config');
const db = require('./database');

const jidUtils = {
  /**
   * isGroupJid
   * @param {string} jid raw jid or normalized
   * @returns {boolean}
   */
  isGroupJid(jid) {
    if (!jid) return false;
    return jid.endsWith('@g.us') || jid.includes('g.us');
  },

  /**
   * extractPhoneFromJid
   * @param {string} rawJid e.g., 6281234@s.whatsapp.net or 6281234-123@g.us
   * @returns {string} normalized phone number like 6281234
   */
  extractPhoneFromJid(rawJid) {
    if (!rawJid) return null;
    // group participant format: 6281234-123@g.us
    const withoutDomain = rawJid.split('@')[0];
    const phone = withoutDomain.split('-')[0];
    return this.normalizePhoneNumber(phone);
  },

  /**
   * normalizePhoneNumber
   * Ensure phone numbers are in international format without plus sign, e.g., 6281234
   */
  normalizePhoneNumber(number) {
    if (!number) return null;
    number = String(number).trim();
    // remove non-digit
    number = number.replace(/\D/g, '');
    // if starts with 0 -> replace with 62
    if (number.startsWith('0')) number = '62' + number.slice(1);
    // if starts with 8 -> assume missing country code
    if (number.startsWith('8')) number = '62' + number;
    // remove leading +
    if (number.startsWith('+')) number = number.slice(1);
    return number;
  },

  /**
   * mapRawJidToOriginalNumber
   * Map a raw jid to original normalized number using group metadata if available
   * @param {string} rawJid
   * @param {object} groupMetadata optional
   */
  mapRawJidToOriginalNumber(rawJid, groupMetadata = null) {
    const phone = this.extractPhoneFromJid(rawJid);
    if (!phone) return null;
    // if group metadata provided, try to find participant mapping
    if (groupMetadata && groupMetadata.participants) {
      const found = groupMetadata.participants.find(p => {
        const pnum = this.extractPhoneFromJid(p.id || p);
        return pnum === phone;
      });
      if (found) return phone;
    }
    return phone;
  },

  /**
   * processJidFromGroupMessage
   * Given a message and group metadata, return normalized sender and participant info
   */
  processJidFromGroupMessage(message, groupMetadata = null) {
    // message.key.participant is raw participant jid; message.key.remoteJid is group jid
    const participant = message?.key?.participant || null;
    const sender = message?.key?.fromMe ? (config.ownerNumber) : (participant || message?.key?.remoteJid);
    const normalized = this.mapRawJidToOriginalNumber(sender, groupMetadata);
    return {
      raw: sender,
      normalized
    };
  },

  /**
   * isOwner
   * Check if a normalized number is owner
   */
  isOwner(normalizedNumber) {
    if (!normalizedNumber) return false;
    const owner = config.ownerNumber;
    return String(normalizedNumber) === String(owner);
  }
};

module.exports = { jidUtils };
