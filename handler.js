/**
 * handler.js
 * Central event handler for incoming messages and events
 */

const { jidUtils } = require('./lib/jidUtils');
const { sendButtonMessage, sendListMessage, sendText } = require('./lib/function');
const { readDB, writeDB } = require('./lib/database');
const serialize = require('./lib/serialize');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const pluginsPath = path.join(__dirname, 'plugins');
const pluginFiles = fs.readdirSync(pluginsPath).filter(f => f.endsWith('.js'));

const plugins = {};
for (const file of pluginFiles) {
  const p = require(path.join(pluginsPath, file));
  plugins[p.name] = p;
}

module.exports = async (sock, ev) => {
  // ev is the Baileys event emitter
  ev.on('messages.upsert', async (m) => {
    try {
      const messages = m.messages;
      for (const raw of messages) {
        if (!raw.message) continue;
        const msg = await serialize(raw, sock);
        if (!msg) continue;

        // Ignore messages from self
        if (msg.isSelf) continue;

        // Basic normalization
        const sender = msg.sender; // normalized phone like 628xx
        const isGroup = msg.isGroup;
        const text = (msg.text || '').trim();

        // Command detection
        const prefix = config.prefix;
        const isCmd = text.startsWith(prefix);
        const args = isCmd ? text.slice(prefix.length).trim().split(/\s+/) : [];
        const command = isCmd ? args.shift().toLowerCase() : null;

        // Global plugin dispatcher
        if (isCmd && command) {
          // iterate plugins to find command
          for (const key of Object.keys(plugins)) {
            const plugin = plugins[key];
            if (!plugin || !plugin.commands) continue;
            if (plugin.commands.includes(command)) {
              // permission checks
              const isOwner = jidUtils.isOwner(sender);
              const groupMeta = msg.groupMetadata || null;
              const isAdmin = groupMeta ? (groupMeta.admins || []).includes(sender) : false;

              // call plugin handler
              try {
                await plugin.exec({
                  sock,
                  msg,
                  command,
                  args,
                  sender,
                  isGroup,
                  isOwner,
                  isAdmin,
                  sendButtonMessage,
                  sendListMessage,
                  sendText,
                  readDB,
                  writeDB,
                  jidUtils,
                  config
                });
              } catch (err) {
                console.error('Plugin error', plugin.name, err);
                await sendText(sock, msg.chatId, `Terjadi error pada plugin ${plugin.name}`);
              }
              break;
            }
          }
        } else {
          // Non-command handlers: antilink, welcome, etc.
          const db = readDB();
          // Anti-link
          const antilink = db.settings?.antilink || { enabled: false, kick: false };
          if (isGroup && antilink.enabled && msg.text) {
            const hasLink = /https?:\/\/|wa.me\/|chat.whatsapp.com\//i.test(msg.text);
            if (hasLink) {
              // if sender is admin or owner, ignore
              const groupMeta = msg.groupMetadata || null;
              const isAdmin = groupMeta ? (groupMeta.admins || []).includes(sender) : false;
              if (!isAdmin && !jidUtils.isOwner(sender)) {
                // delete message and optionally kick
                try {
                  await sock.sendMessage(msg.chatId, { delete: { remoteJid: msg.chatId, fromMe: false, id: msg.id } });
                } catch (e) {
                  // ignore
                }
                if (antilink.kick) {
                  try {
                    await sock.groupParticipantsUpdate(msg.chatId, [msg.senderJid], 'remove');
                  } catch (e) {
                    // ignore
                  }
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('messages.upsert handler error', err);
    }
  });

  // group updates
  ev.on('groups.update', async (updates) => {
    for (const u of updates) {
      console.log('Group update', u);
    }
  });

  // connection updates handled in connection.js
};
