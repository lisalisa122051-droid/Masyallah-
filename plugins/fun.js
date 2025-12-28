// Plugin fitur hiburan sederhana
module.exports = {
    name: 'fun',
    pattern: /^(\.fun|!fun)$/i,
    adminOnly: false,
    ownerOnly: false,
    async execute(sock, m) {
        const funQuotes = [
            '🚀 Bot ini untuk belajar coding!',
            '📚 Struktur modular = mudah maintenance',
            '💻 Plugin system = extensible',
            '🛡️ No spam, no phishing, pure education'
        ];
        
        const randomQuote = funQuotes[Math.floor(Math.random() * funQuotes.length)];
        
        await sock.sendMessage(m.from, { 
            text: `🎮 *FUN MODE*\n\n${randomQuote}\n\n*Ketik .menu untuk fitur lain*` 
        });
    }
};
