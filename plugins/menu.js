/**
 * plugins/menu.js
 * Commands:
 * - menu (Button Message)
 * - allmenu (List Message)
 * - help
 */

const name = 'menu';
const commands = ['menu', 'allmenu', 'help'];

async function exec(ctx) {
  const { sock, msg, command, sendButtonMessage, sendListMessage, sendText, config } = ctx;
  const chatId = msg.chatId;

  if (command === 'menu') {
    const text = `≡ ${config.botName} Menu\nPilih tombol di bawah untuk cepat mengakses fitur.`;
    const footer = `© ${config.botName} | ${config.version}`;
    const buttons = [
      { id: '.allmenu', title: 'All Menu' },
      { id: '.ping', title: 'Ping' },
      { id: '.infobot', title: 'Info Bot' }
    ];
    await sendButtonMessage(sock, chatId, text, footer, buttons);
  } else if (command === 'allmenu') {
    const title = '≡ Lihat Menu';
    const description = 'Pilih kategori untuk melihat perintah';
    const buttonText = 'Pilih Menu';
    const footer = `© ${config.botName}`;
    const sections = [
      {
        title: 'Main',
        rows: [
          { id: '.menu', title: 'Menu', description: 'Tampilkan menu button' },
          { id: '.ping', title: 'Ping', description: 'Cek response bot' },
          { id: '.infobot', title: 'Info Bot', description: 'Informasi tentang bot' }
        ]
      },
      {
        title: 'Group',
        rows: [
          { id: '.group', title: 'Group Menu', description: 'Perintah group' }
        ]
      },
      {
        title: 'Download',
        rows: [
          { id: '.play', title: 'Play', description: 'Download audio/video' },
          { id: '.ytvideo', title: 'YouTube Video', description: 'Download video dari YouTube' }
        ]
      }
    ];
    await sendListMessage(sock, chatId, title, description, buttonText, sections, footer);
  } else if (command === 'help') {
    const text = 'Ketik .menu atau .allmenu untuk melihat daftar perintah.';
    await sendText(sock, chatId, text);
  }
}

module.exports = { name, commands, exec };
