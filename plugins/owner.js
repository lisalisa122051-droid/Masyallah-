// Plugin khusus owner - contoh permission system
const config = require('../config');
const { isOwner } = require('../lib/jidUtils');

module.exports = {
    name: 'owner',
    pattern: /^(\.owner|!owner)$/i,
    adminOnly: false,
    ownerOnly: true, // Hanya owner yang bisa akses
    async execute(sock, m) {
        const ownerList = config.bot.owner.map(jid => jid.replace('@s.whatsapp.net', '')).join(', ');
        
        await sock.sendMessage(m.from, { 
            text: `👑 *Owner Bot*
            
Nomor Owner: ${ownerList}
Status: Active ✅

*Fitur Owner:*
• Restart bot
• Broadcast
• Kelola plugin

*Ketik .menu untuk menu utama*`
        });
    }
};
