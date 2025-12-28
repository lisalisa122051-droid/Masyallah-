const { getRandom } = require('../lib/function.js');

module.exports = {
    commands: ['menu', 'allmenu', 'help'],
    description: 'Show bot menu',
    
    execute: async (client, m, args, text) => {
        const { sender, from, reply } = m;
        const prefix = global.prefix;
        
        // Button Message for .menu
        if (m.body === `${prefix}menu`) {
            const buttons = [
                { buttonId: `${prefix}allmenu`, buttonText: { displayText: '📋 LIST MENU' }, type: 1 },
                { buttonId: `${prefix}ping`, buttonText: { displayText: '🏓 PING' }, type: 1 },
                { buttonId: `${prefix}owner`, buttonText: { displayText: '👤 OWNER' }, type: 1 },
                { buttonId: `${prefix}infobot`, buttonText: { displayText: '🤖 BOT INFO' }, type: 1 }
            ];
            
            const buttonMessage = {
                text: `*${global.botName} MENU*\n\nHello @${sender.split('@')[0]}! I'm a WhatsApp bot.\n\n*Prefix:* ${prefix}\n*Owner:* ${global.owner.map(o => o).join(', ')}\n\nClick button below:`,
                footer: 'Powered by Baileys MD',
                buttons: buttons,
                headerType: 1,
                mentions: [sender]
            };
            
            return client.sendMessage(from, buttonMessage);
        }
        
        // List Message for .allmenu
        if (m.body === `${prefix}allmenu` || m.body === `${prefix}help`) {
            const sections = [
                {
                    title: "📁 CORE",
                    rows: [
                        { title: "PING", rowId: `${prefix}ping`, description: "Check bot latency" },
                        { title: "MENU", rowId: `${prefix}menu`, description: "Show button menu" },
                        { title: "INFO BOT", rowId: `${prefix}infobot`, description: "Bot information" }
                    ]
                },
                {
                    title: "👤 OWNER",
                    rows: [
                        { title: "OWNER", rowId: `${prefix}owner`, description: "Contact owner" },
                        { title: "RESTART", rowId: `${prefix}restart`, description: "Restart bot (owner)" }
                    ]
                },
                {
                    title: "👥 GROUP",
                    rows: [
                        { title: "SETNAME", rowId: `${prefix}setname`, description: "Change group name" },
                        { title: "WELCOME ON/OFF", rowId: `${prefix}welcome`, description: "Toggle welcome" },
                        { title: "PROMOTE", rowId: `${prefix}promote`, description: "Promote member" }
                    ]
                },
                {
                    title: "🎉 FUN",
                    rows: [
                        { title: "JOKE", rowId: `${prefix}joke`, description: "Random joke" },
                        { title: "TRUTH", rowId: `${prefix}truth`, description: "Truth question" },
                        { title: "DARE", rowId: `${prefix}dare`, description: "Dare challenge" }
                    ]
                },
                {
                    title: "⬇️ DOWNLOAD",
                    rows: [
                        { title: "PLAY", rowId: `${prefix}play`, description: "Download audio/video" },
                        { title: "TIKTOK", rowId: `${prefix}tiktok`, description: "Download TikTok" },
                        { title: "INSTAGRAM", rowId: `${prefix}instagram`, description: "Download IG" }
                    ]
                },
                {
                    title: "🛠️ TOOLS",
                    rows: [
                        { title: "STICKER", rowId: `${prefix}sticker`, description: "Create sticker" },
                        { title: "TOIMG", rowId: `${prefix}toimg`, description: "Convert sticker to image" },
                        { title: "SHORTLINK", rowId: `${prefix}shortlink`, description: "Shorten URL" }
                    ]
                }
            ];
            
            const listMessage = {
                text: `*${global.botName} ALL MENU*\nTotal commands: ${sections.reduce((a, b) => a + b.rows.length, 0)}`,
                footer: "Select from list below",
                title: "FULL MENU",
                buttonText: "OPEN MENU",
                sections
            };
            
            return client.sendMessage(from, listMessage);
        }
    }
};
