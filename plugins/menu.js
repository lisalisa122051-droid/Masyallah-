const config = require('../config.js');

const commands = {
    menu: {
        help: 'Show interactive menu',
        category: 'Main',
        execute: async (sock, message) => {
            const { from, pushName } = message;
            
            const menuText = `👋 Hello *${pushName}*! I'm *${config.botname}*

📁 *MAIN MENU*

Select a category below:`;

            const buttons = [
                { buttonId: 'allmenu', buttonText: { displayText: '📋 ALL MENU' }, type: 1 },
                { buttonId: 'infobot', buttonText: { displayText: '🤖 BOT INFO' }, type: 1 },
                { buttonId: 'owner', buttonText: { displayText: '👑 OWNER' }, type: 1 }
            ];

            const sections = [
                {
                    title: "QUICK ACCESS",
                    rows: [
                        { title: "📋 ALL MENU", rowId: "allmenu" },
                        { title: "🤖 BOT INFO", rowId: "infobot" },
                        { title: "👑 OWNER MENU", rowId: "owner" }
                    ]
                }
            ];

            // Send button message
            await sock.sendMessage(from, {
                text: menuText,
                footer: `Prefix: ${config.prefix.join(', ')}`,
                buttons: buttons,
                headerType: 1
            });
        }
    },
    
    allmenu: {
        help: 'Show all commands in list format',
        category: 'Main',
        execute: async (sock, message) => {
            const { from } = message;
            
            const sections = [
                {
                    title: "📁 MAIN MENU",
                    rows: [
                        { title: "📊 BOT INFO", rowId: "infobot", description: "Bot information" },
                        { title: "⚡ SPEED TEST", rowId: "ping", description: "Check bot speed" }
                    ]
                },
                {
                    title: "🎮 FUN MENU",
                    rows: [
                        { title: "😂 JOKE", rowId: "joke", description: "Random jokes" },
                        { title: "🎯 TRUTH/DARE", rowId: "truth", description: "Truth or dare game" },
                        { title: "⭐ RATE", rowId: "rate", description: "Rate something" }
                    ]
                },
                {
                    title: "⬇️ DOWNLOAD MENU",
                    rows: [
                        { title: "🎵 YOUTUBE AUDIO", rowId: "play audio", description: "Download YouTube audio" },
                        { title: "🎬 YOUTUBE VIDEO", rowId: "ytvideo", description: "Download YouTube video" },
                        { title: "📱 TIKTOK", rowId: "tiktok", description: "Download TikTok video" },
                        { title: "📸 INSTAGRAM", rowId: "instagram", description: "Download Instagram content" }
                    ]
                },
                {
                    title: "🛠️ TOOLS MENU",
                    rows: [
                        { title: "🖼️ STICKER", rowId: "sticker", description: "Create sticker from image" },
                        { title: "🔗 SHORTLINK", rowId: "shortlink", description: "Shorten URL" },
                        { title: "🎵 TO AUDIO", rowId: "toaudio", description: "Convert video to audio" }
                    ]
                },
                {
                    title: "👥 GROUP MENU",
                    rows: [
                        { title: "👋 WELCOME", rowId: "welcome on", description: "Toggle welcome message" },
                        { title: "🚫 ANTILINK", rowId: "antilink on", description: "Toggle anti-link" },
                        { title: "📛 SET NAME", rowId: "setname", description: "Change group name" }
                    ]
                }
            ];

            await sock.sendMessage(from, {
                text: `📚 *ALL MENU*\n\nSelect a command from the list below:`,
                footer: `${config.botname} • Total commands: 20+`,
                title: "COMMAND LIST",
                buttonText: "Choose Command",
                sections
            });
        }
    },
    
    help: {
        help: 'Show help for specific command',
        category: 'Main',
        execute: async (sock, message, args) => {
            const { from } = message;
            
            if (args.length === 0) {
                await sock.sendMessage(from, {
                    text: `Usage: .help <command>\nExample: .help sticker`
                });
                return;
            }
            
            const cmd = args[0].toLowerCase();
            let helpText = `Help for command: *${cmd}*\n\n`;
            
            // Search through all plugins
            const plugins = require('../handler.js');
            let found = false;
            
            // This is a simplified search - in real implementation you'd search through all registered commands
            const commandHelp = {
                'sticker': 'Create sticker from image/video\nUsage: .sticker <reply to image/video>',
                'ping': 'Check bot response time\nUsage: .ping',
                'play': 'Download YouTube audio/video\nUsage: .play <url>',
                'joke': 'Get random joke\nUsage: .joke',
                'owner': 'Show owner menu\nUsage: .owner',
                'menu': 'Show interactive menu\nUsage: .menu'
            };
            
            if (commandHelp[cmd]) {
                helpText += commandHelp[cmd];
                found = true;
            }
            
            if (!found) {
                helpText = `Command *${cmd}* not found. Use .allmenu to see available commands.`;
            }
            
            await sock.sendMessage(from, { text: helpText });
        }
    }
};

module.exports = { commands };
