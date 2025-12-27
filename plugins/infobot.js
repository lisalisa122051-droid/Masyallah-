const config = require('../config.js');
const { formatTime } = require('../lib/function.js');
const db = require('../lib/database.js');
const os = require('os');

const commands = {
    infobot: {
        help: 'Show bot information',
        category: 'Main',
        execute: async (sock, message) => {
            const { from } = message;
            
            const uptime = process.uptime();
            const formattedUptime = formatTime(uptime * 1000);
            
            const botInfo = {
                name: config.botname,
                prefix: config.prefix.join(', '),
                owner: config.owner.map(num => `@${num}`).join(', '),
                uptime: formattedUptime,
                platform: process.platform,
                node: process.version,
                memory: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`,
                totalUsers: Object.keys(db.getAll().users || {}).length,
                totalGroups: Object.keys(db.getAll().groups || {}).length
            };
            
            const infoText = `🤖 *${botInfo.name}*\n\n` +
                `📌 *Prefix:* ${botInfo.prefix}\n` +
                `👑 *Owner:* ${botInfo.owner}\n` +
                `⏱️ *Uptime:* ${botInfo.uptime}\n` +
                `💾 *Memory:* ${botInfo.memory}\n` +
                `📊 *Platform:* ${botInfo.platform}\n` +
                `🔧 *Node.js:* ${botInfo.node}\n` +
                `👤 *Users:* ${botInfo.totalUsers}\n` +
                `👥 *Groups:* ${botInfo.totalGroups}\n\n` +
                `_Type .menu to see all commands_`;
            
            await sock.sendMessage(from, { text: infoText });
        }
    },
    
    botinfo: {
        help: 'Show detailed bot information',
        category: 'Main',
        execute: async (sock, message) => {
            const { from } = message;
            
            const sections = [
                {
                    title: "🤖 BOT INFORMATION",
                    rows: [
                        { title: "📛 NAME", rowId: "botname", description: config.botname },
                        { title: "📌 PREFIX", rowId: "prefix", description: config.prefix.join(', ') },
                        { title: "⚙️ VERSION", rowId: "version", description: "1.0.0" },
                        { title: "📁 LIBRARY", rowId: "library", description: "Baileys MD" }
                    ]
                },
                {
                    title: "📊 STATISTICS",
                    rows: [
                        { title: "👤 TOTAL USERS", rowId: "totalusers", description: Object.keys(db.getAll().users || {}).length + " users" },
                        { title: "👥 TOTAL GROUPS", rowId: "totalgroups", description: Object.keys(db.getAll().groups || {}).length + " groups" },
                        { title: "💾 DATABASE SIZE", rowId: "dbsize", description: (JSON.stringify(db.getAll()).length / 1024).toFixed(2) + " KB" }
                    ]
                }
            ];
            
            await sock.sendMessage(from, {
                text: `*BOT INFORMATION*\n\nSelect an option below:`,
                footer: `${config.botname} • Multi-Device WhatsApp Bot`,
                title: "🤖 BOT INFO",
                buttonText: "View Details",
                sections
            });
        }
    },
    
    about: {
        help: 'About this bot',
        category: 'Main',
        execute: async (sock, message) => {
            const { from } = message;
            
            const aboutText = `*ABOUT ${config.botname.toUpperCase()}*\n\n` +
                `✨ *Multi-Device WhatsApp Bot*\n` +
                `🚀 *Built with:* Node.js & Baileys\n` +
                `📁 *Features:* 20+ commands\n` +
                `⚡ *Performance:* High speed\n` +
                `🔒 *Security:* Encrypted sessions\n\n` +
                `_This bot is developed for educational purposes._\n` +
                `_Please use it responsibly!_`;
            
            const buttons = [
                { buttonId: 'menu', buttonText: { displayText: '📋 MENU' }, type: 1 },
                { buttonId: 'owner', buttonText: { displayText: '👑 OWNER' }, type: 1 }
            ];
            
            await sock.sendMessage(from, {
                text: aboutText,
                footer: "Open source • Free to use",
                buttons: buttons,
                headerType: 1
            });
        }
    }
};

module.exports = { commands };
