/**
 * plugins/infobot.js
 * Commands:
 * - infobot
 * - botinfo
 * - about
 */

const name = 'infobot';
const commands = ['infobot', 'botinfo', 'about'];

async function exec(ctx) {
  const { sock, msg, command, sendText, config } = ctx;
  const chatId = msg.chatId;

  const info = `📌 Info Bot\nName: ${config.botName}\nVersion: ${config.version}\nOwner: ${config.ownerNumber}\nPrefix: ${config.prefix}`;
  await sendText(sock, chatId, info);
}

module.exports = { name, commands, exec };
