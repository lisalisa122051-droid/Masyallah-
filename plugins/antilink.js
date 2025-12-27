/**
 * plugins/antilink.js
 * Anti-link management:
 * - antilink on/off
 * - auto delete link
 * - kick pelanggar (admin immune)
 */

const name = 'antilink';
const commands = ['antilink'];

async function exec(ctx) {
  const { sock, msg, command, args, sendText, readDB, writeDB, jidUtils } = ctx;
  const chatId = msg.chatId;
  const sender = msg.sender;

  if (!msg.isGroup) return await sendText(sock, chatId, 'Perintah ini hanya untuk grup.');

  const db = readDB();
  const sub = args[0] || '';
  if (sub === 'on') {
    db.settings.antilink.enabled = true;
    db.settings.antilink.kick = args[1] === 'kick';
    writeDB();
    await sendText(sock, chatId, `Anti-link diaktifkan. Kick: ${db.settings.antilink.kick}`);
  } else if (sub === 'off') {
    db.settings.antilink.enabled = false;
    db.settings.antilink.kick = false;
    writeDB();
    await sendText(sock, chatId, 'Anti-link dinonaktifkan.');
  } else {
    await sendText(sock, chatId, 'Gunakan: .antilink on [kick] / .antilink off');
  }
}

module.exports = { name, commands, exec };
