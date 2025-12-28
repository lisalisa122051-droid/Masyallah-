// Plugin info bot dengan thumbnail style
const config = require('../config');

module.exports = {
    name: 'infobot',
    pattern: /^(\.infobot|!bot)$/i,
    adminOnly: false,
    ownerOnly: false,
    async execute(sock, m) {
        const infoText = `
📱 *${config.bot.name}*
  
├❖ *Version* : 1.0.0
├❖ *Runtime* : Node.js
├❖ *Library* : Baileys MD
├❖ *Status* : Active ✅
└❖ *Plugins* : ${require('../handler').plugins.length}

*Ketik .menu untuk melihat semua fitur*
        `.trim();

        const buttonMessage = {
            text: infoText,
            footer: `Educational Bot ${new Date().getFullYear()}`,
            buttons: [
                {
                    buttonId: '.menu',
                    buttonText: { displayText: '📋 MENU' },
                    type: 1
                }
            ],
            headerType: 1
        };

        await sock.sendMessage(m.from, buttonMessage);
    }
};
