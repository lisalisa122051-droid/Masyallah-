// Plugin download media (contoh aman)
module.exports = {
    name: 'download',
    pattern: /^(\.dl|!dl)$/i,
    adminOnly: false,
    ownerOnly: false,
    async execute(sock, m) {
        let text = '';
        
        if (m.quoted) {
            // Jika ada quoted message dengan media
            if (m.quoted.message.imageMessage || m.quoted.message.videoMessage) {
                await sock.sendMessage(m.from, {
                    text: '📥 *DOWNLOAD MEDIA*\n\nMedia dari reply terkirim ulang!',
                    quoted: m.quoted.key
                });
                return;
            }
        }
        
        text = `📥 *DOWNLOAD TOOLS*
        
Cara pakai:
1. Reply gambar/video dengan .dl
2. Bot akan forward media tersebut

*Fitur lain segera hadir di update pembelajaran*`;
        
        await sock.sendMessage(m.from, { text });
    }
};
