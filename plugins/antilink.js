// Plugin anti-link grup (contoh pengelolaan grup)
const db = require('../lib/database');

module.exports = {
    name: 'antilink',
    pattern: /^(https?:\/\/|www\.|t\.me|bit\.ly)/i,
    adminOnly: false,
    ownerOnly: false,
    async execute(sock, m) {
        if (!m.isGroup) return; // Hanya di grup
        
        // Simpan pengirim link ke database (untuk demo)
        db.push('links_detected', {
            sender: m.sender,
            link: m.body,
            group: m.from,
            time: new Date().toISOString()
        });
        
        await sock.sendMessage(m.from, { 
            text: `🚫 *ANTI-LINK DETECTED*
            
@${m.sender.split('@')[0]} mengirim link!
            
Admin dapat kick jika melanggar aturan grup.`,
            mentions: [m.sender]
        }, { quoted: m });
    }
};

