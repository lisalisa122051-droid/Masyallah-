/**
 * plugins/tools.js
 * Tools:
 * - sticker
 * - toimg
 * - toaudio
 * - shortlink
 *
 * Note: These are demo implementations. For full media processing, integrate ffmpeg or external APIs.
 */

const name = 'tools';
const commands = ['sticker', 'toimg', 'toaudio', 'shortlink'];
const axios = require('axios');

async function exec(ctx) {
  const { sock, msg, command, args, sendText } = ctx;
  const chatId = msg.chatId;

  if (command === 'sticker') {
    await sendText(sock, chatId, 'Fitur sticker demo. Kirim gambar dengan caption .sticker');
  } else if (command === 'toimg') {
    await sendText(sock, chatId, 'Fitur toimg demo. Kirim sticker untuk dikonversi.');
  } else if (command === 'toaudio') {
    await sendText(sock, chatId, 'Fitur toaudio demo. Kirim video untuk dikonversi ke audio.');
  } else if (command === 'shortlink') {
    const url = args[0];
    if (!url) return await sendText(sock, chatId, 'Masukkan URL untuk dipendekkan.');
    try {
      const res = await axios.get(`http://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
      await sendText(sock, chatId, `Shortlink: ${res.data}`);
    } catch (e) {
      await sendText(sock, chatId, 'Gagal membuat shortlink.');
    }
  }
}

module.exports = { name, commands, exec };
