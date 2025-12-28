const os = require('os');
const moment = require('moment-timezone');

module.exports = {
    commands: ['infobot', 'botinfo', 'about'],
    description: 'Show bot information',
    
    execute: async (client, m, args, text) => {
        const { reply } = m;
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        const info = `
*🤖 ${global.botName} INFORMATION*

*👤 Owner:* ${global.owner.join(', ')}
*🖥️ Host:* ${os.hostname()}
*📈 Platform:* ${os.platform()} ${os.arch()}
*📊 Memory:* ${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB / ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB
*⏰ Uptime:* ${hours}h ${minutes}m ${seconds}s
*📅 Date:* ${moment().tz('Asia/Jakarta').format('DD MMM YYYY HH:mm:ss')}
*🔧 Prefix:* ${global.prefix}
*💻 Node.js:* ${process.version}
*📦 Baileys:* Custom MD

*Thank you for using this bot!*
        `.trim();
        
        await reply(info);
    }
};
