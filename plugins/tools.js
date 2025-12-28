// Plugin tools umum
module.exports = {
    name: 'tools',
    pattern: /^(\.tools|!tools)$/i,
    adminOnly: false,
    ownerOnly: false,
    async execute(sock, m) {
        const toolsText = `🔧 *UTILITY TOOLS*

✂️ *.sticker* - Buat sticker
🔄 *.toimg* - Sticker ke gambar  
🎭 *.tomp3* - Video ke audio
📝 *.quoted* - Reply dengan quote

*Ketik perintah langsung untuk gunakan*`;
        
        await sock.sendMessage(m.from, { text: toolsText });
    }
};
