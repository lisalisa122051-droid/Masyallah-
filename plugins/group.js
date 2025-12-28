// Plugin pengelolaan grup dasar
const { isAdmin } = require('../lib/jidUtils');
const db = require('../lib/database');

module.exports = {
    name: 'group',
    pattern: /^(\.group|!group)$/i,
    adminOnly: true, // Hanya admin grup
    ownerOnly: false,
    async execute(sock, m) {
        const isAdminGroup = await isAdmin(sock, m.sender, m.from);
        
        if (!isAdminGroup && m.isGroup) {
            return sock.sendMessage(m.from, { text: '❌ Hanya admin grup yang bisa akses!' });
        }

        const buttons = [
            { buttonId: '.kick', buttonText: { displayText: '👢 Kick' }, type: 1 },
            { buttonId: '.promote', buttonText: { displayText: '⭐ Promote' }, type: 1 },
            { buttonId: '.demote', buttonText: { displayText: '📉 Demote' }, type: 1 },
            { buttonId: '.linkgroup', buttonText: { displayText: '🔗 Link Grup' }, type: 1 }
        ];

        await sock.sendMessage(m.from, {
            text: '🛠️ *GROUP TOOLS*\n\nPilih aksi grup:',
            footer: 'EduBot Group Manager',
            buttons: buttons,
            headerType: 1
        });
    }
};
