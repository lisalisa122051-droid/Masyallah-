// Plugin menu interaktif
const { sendListMessage } = require('../lib/function');
const config = require('../config');

module.exports = {
    name: 'menu',
    pattern: /^(\.menu|!menu)$/i,
    adminOnly: false,
    ownerOnly: false,
    async execute(sock, m) {
        const sections = [
            {
                title: "📋 Menu Utama",
                rows: [
                    { title: "ℹ️ Info Bot", rowId: ".infobot", description: "Informasi bot" },
                    { title: "⚡ Ping", rowId: ".ping", description: "Cek kecepatan bot" },
                    { title: "👑 Owner", rowId: ".owner", description: "Info owner" },
                    { title: "💬 Grup", rowId: ".group", description: "Kelola grup" },
                    { title: "🎮 Fun", rowId: ".fun", description: "Fitur hiburan" }
                ]
            }
        ];

        await sendListMessage(
            sock, 
            m.from, 
            `${config.bot.name}`, 
            "Pilih menu yang ingin digunakan:", 
            sections
        );
    }
};
