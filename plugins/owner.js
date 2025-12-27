/**
 * plugins/owner.js
 * OWNER ONLY commands:
 * - owner
 * - self
 * - public
 * - restart
 * - eval
 */

const name = 'owner';
const commands = ['owner', 'self', 'public', 'restart', 'eval'];

async function exec(ctx) {
  const { sock, msg, command, args, sendText, jidUtils, config } = ctx;
  const chatId = msg.chatId;
  const sender = msg.sender;

  if (!jidUtils.isOwner(sender)) {
    return await sendText(sock, chatId, 'Perintah ini hanya untuk owner.');
  }

  if (command === 'owner') {
    await sendText(sock, chatId, `Owner: ${config.ownerNumber}`);
  } else if (command === 'self') {
    // set bot to self mode (example toggle)
    await sendText(sock, chatId, 'Mode self diaktifkan (demo).');
  } else if (command === 'public') {
    await sendText(sock, chatId, 'Mode public diaktifkan (demo).');
  } else if (command === 'restart') {
    await sendText(sock, chatId, 'Restarting bot...');
    process.exit(0);
  } else if (command === 'eval') {
    const code = args.join(' ');
    try {
      const result = eval(code);
      await sendText(sock, chatId, `Result: ${String(result)}`);
    } catch (e) {
      await sendText(sock, chatId, `Eval error: ${e.message}`);
    }
  }
}

module.exports = { name, commands, exec };
