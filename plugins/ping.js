/**
 * plugins/ping.js
 * Commands:
 * - ping
 * - speed
 * - runtime
 */

const name = 'ping';
const commands = ['ping', 'speed', 'runtime'];

const startTime = Date.now();

async function exec(ctx) {
  const { sock, msg, command, sendText } = ctx;
  const chatId = msg.chatId;

  if (command === 'ping') {
    const now = Date.now();
    const latency = now - (msg.messageTimestamp || now);
    await sendText(sock, chatId, `Pong!\nLatency: ${latency} ms`);
  } else if (command === 'speed') {
    const t0 = Date.now();
    for (let i = 0; i < 100000; i++) { Math.sqrt(i); }
    const t1 = Date.now();
    await sendText(sock, chatId, `Speed test: ${t1 - t0} ms`);
  } else if (command === 'runtime') {
    const uptime = Date.now() - startTime;
    const seconds = Math.floor(uptime / 1000) % 60;
    const minutes = Math.floor(uptime / (1000 * 60)) % 60;
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    await sendText(sock, chatId, `Runtime: ${hours}h ${minutes}m ${seconds}s`);
  }
}

module.exports = { name, commands, exec };
