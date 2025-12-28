// Plugin ping sederhana
module.exports = {
    name: 'ping',
    pattern: /^(\.ping|!ping)$/i,
    adminOnly: false,
    ownerOnly: false,
    async execute(sock, m) {
        const start = new Date().getTime();
        await sock.sendMessage(m.from, { text: 'Pong!' });
        const end = new Date().getTime();
        await sock.sendMessage(m.from, { 
            text: `⏱️ Speed: ${end - start}ms` 
        });
    }
};
