/**
 * plugins/fun.js
 * Fun commands:
 * - joke
 * - tebakgambar
 * - truth
 * - dare
 * - rate
 */

const name = 'fun';
const commands = ['joke', 'tebakgambar', 'truth', 'dare', 'rate'];

const jokes = [
  'Kenapa programmer suka kopi? Karena tanpa kopi, bug tidak bisa di-debug.',
  'Kenapa keyboard selalu dingin? Karena ada banyak fans.'
];

async function exec(ctx) {
  const { sock, msg, command, sendText } = ctx;
  const chatId = msg.chatId;

  if (command === 'joke') {
    const j = jokes[Math.floor(Math.random() * jokes.length)];
    await sendText(sock, chatId, `Joke: ${j}`);
  } else if (command === 'tebakgambar') {
    await sendText(sock, chatId, 'Tebak gambar: (fitur demo) Kirim jawaban Anda.');
  } else if (command === 'truth') {
    await sendText(sock, chatId, 'Truth: Apa rahasia kecilmu? (demo)');
  } else if (command === 'dare') {
    await sendText(sock, chatId, 'Dare: Kirim foto dengan pose lucu! (demo)');
  } else if (command === 'rate') {
    const target = msg.quoted ? msg.quoted.sender : msg.sender;
    const score = Math.floor(Math.random() * 10) + 1;
    await sendText(sock, chatId, `Rate: ${score}/10`);
  }
}

module.exports = { name, commands, exec };
