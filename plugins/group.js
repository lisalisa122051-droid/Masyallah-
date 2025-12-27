/**
 * plugins/group.js
 * GROUP & ADMIN commands:
 * - welcome on/off
 * - setname
 * - setdesc
 * - open
 * - close
 * - kick
 * - add
 * - promote
 * - demote
 *
 * Note: This plugin expects group context for many commands.
 */

const name = 'group';
const commands = ['welcome', 'setname', 'setdesc', 'open', 'close', 'kick', 'add', 'promote', 'demote', 'group'];

async function exec(ctx) {
  const { sock, msg, command, args, sendText, jidUtils, readDB, writeDB } = ctx;
  const chatId = msg.chatId;
  const sender = msg.sender;
  const isGroup = msg.isGroup;
  const groupMeta = msg.groupMetadata;

  if (!isGroup) return await sendText(sock, chatId, 'Perintah ini hanya dapat digunakan di grup.');

  const isAdmin = groupMeta ? groupMeta.admins.includes(sender) : false;
  if (!isAdmin && !jidUtils.isOwner(sender)) return await sendText(sock, chatId, 'Hanya admin grup yang dapat menggunakan perintah ini.');

  if (command === 'welcome') {
    const sub = args[0] || '';
    const db = readDB();
    if (sub === 'on') {
      db.settings.welcome[chatId] = true;
      writeDB();
      await sendText(sock, chatId, 'Welcome diaktifkan untuk grup ini.');
    } else if (sub === 'off') {
      db.settings.welcome[chatId] = false;
      writeDB();
      await sendText(sock, chatId, 'Welcome dinonaktifkan untuk grup ini.');
    } else {
      await sendText(sock, chatId, 'Gunakan: .welcome on / .welcome off');
    }
  } else if (command === 'setname') {
    const newName = args.join(' ');
    if (!newName) return await sendText(sock, chatId, 'Masukkan nama grup baru.');
    try {
      await sock.groupUpdateSubject(chatId, newName);
      await sendText(sock, chatId, `Nama grup diubah menjadi: ${newName}`);
    } catch (e) {
      await sendText(sock, chatId, 'Gagal mengubah nama grup.');
    }
  } else if (command === 'setdesc') {
    const newDesc = args.join(' ');
    if (!newDesc) return await sendText(sock, chatId, 'Masukkan deskripsi grup baru.');
    try {
      await sock.groupUpdateDescription(chatId, newDesc);
      await sendText(sock, chatId, 'Deskripsi grup berhasil diubah.');
    } catch (e) {
      await sendText(sock, chatId, 'Gagal mengubah deskripsi grup.');
    }
  } else if (command === 'open') {
    try {
      await sock.groupSettingUpdate(chatId, 'not_announcement');
      await sendText(sock, chatId, 'Grup dibuka. Semua anggota dapat mengirim pesan.');
    } catch (e) {
      await sendText(sock, chatId, 'Gagal membuka grup.');
    }
  } else if (command === 'close') {
    try {
      await sock.groupSettingUpdate(chatId, 'announcement');
      await sendText(sock, chatId, 'Grup ditutup. Hanya admin yang dapat mengirim pesan.');
    } catch (e) {
      await sendText(sock, chatId, 'Gagal menutup grup.');
    }
  } else if (command === 'kick') {
    const target = args[0];
    if (!target) return await sendText(sock, chatId, 'Masukkan nomor target untuk kick (contoh: 62812xxxx).');
    const normalized = jidUtils.normalizePhoneNumber(target);
    try {
      await sock.groupParticipantsUpdate(chatId, [`${normalized}@s.whatsapp.net`], 'remove');
      await sendText(sock, chatId, `Berhasil mengeluarkan: ${normalized}`);
    } catch (e) {
      await sendText(sock, chatId, 'Gagal mengeluarkan user.');
    }
  } else if (command === 'add') {
    const target = args[0];
    if (!target) return await sendText(sock, chatId, 'Masukkan nomor target untuk add (contoh: 62812xxxx).');
    const normalized = jidUtils.normalizePhoneNumber(target);
    try {
      await sock.groupParticipantsUpdate(chatId, [`${normalized}@s.whatsapp.net`], 'add');
      await sendText(sock, chatId, `Berhasil menambahkan: ${normalized}`);
    } catch (e) {
      await sendText(sock, chatId, 'Gagal menambahkan user.');
    }
  } else if (command === 'promote' || command === 'demote') {
    const target = args[0];
    if (!target) return await sendText(sock, chatId, 'Masukkan nomor target untuk promote/demote (contoh: 62812xxxx).');
    const normalized = jidUtils.normalizePhoneNumber(target);
    try {
      await sock.groupParticipantsUpdate(chatId, [`${normalized}@s.whatsapp.net`], command === 'promote' ? 'promote' : 'demote');
      await sendText(sock, chatId, `${command === 'promote' ? 'Promote' : 'Demote'} berhasil: ${normalized}`);
    } catch (e) {
      await sendText(sock, chatId, `${command === 'promote' ? 'Promote' : 'Demote'} gagal.`);
    }
  } else if (command === 'group') {
    const sections = [
      {
        title: 'Group Commands',
        rows: [
          { id: '.setname', title: 'Set Name', description: 'Ubah nama grup' },
          { id: '.setdesc', title: 'Set Description', description: 'Ubah deskripsi grup' },
          { id: '.open', title: 'Open Group', description: 'Buka grup untuk semua anggota' },
          { id: '.close', title: 'Close Group', description: 'Tutup grup untuk anggota' }
        ]
      }
    ];
    await ctx.sendListMessage(sock, chatId, 'Group Menu', 'Pilih perintah group', 'Pilih', sections, 'Group Menu');
  }
}

module.exports = { name, commands, exec };
