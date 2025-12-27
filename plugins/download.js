/**
 * plugins/download.js
 * Download commands:
 * - play (Button pilih audio/video)
 * - ytvideo
 * - tiktok
 * - instagram
 *
 * NOTE: This plugin provides demo placeholders for download features.
 */

const name = 'download';
const commands = ['play', 'ytvideo', 'tiktok', 'instagram'];

async function exec(ctx) {
  const { sock, msg, command, args, sendButtonMessage, sendText } = ctx;
  const chatId = msg.chatId;

  if (command === 'play') {
    const text = 'Pilih format download:';
    const footer = 'Pilih Audio atau Video';
    const buttons = [
      { id: '.play audio', title: 'Audio' },
      { id: '.play video', title: 'Video' },
      { id: '.play info', title: 'Info' }
    ];
    await sendButtonMessage(sock, chatId, text, footer, buttons);
  } else if (command === 'ytvideo') {
    const url = args[0];
    if (!url) return await sendText(sock, chatId, 'Masukkan link YouTube.');
    await sendText(sock, chatId, `Mendownload video dari: ${url}\n(Demo - implementasi download diperlukan)`);
  } else if (command === 'tiktok') {
    const url = args[0];
    if (!url) return await sendText(sock, chatId, 'Masukkan link TikTok.');
    await sendText(sock, chatId, `Mendownload TikTok dari: ${url}\n(Demo)`);
  } else if (command === 'instagram') {
    const url = args[0];
    if (!url) return await sendText(sock, chatId, 'Masukkan link Instagram.');
    await sendText(sock, chatId, `Mendownload Instagram dari: ${url}\n(Demo)`);
  }
}

module.exports = { name, commands, exec };
