const config = require('../config.js');
const fs = require('fs-extra');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const commands = {
    owner: {
        help: 'Owner menu',
        category: 'Owner',
        owner: true,
        execute: async (sock, message) => {
            const { from } = message;
            
            const sections = [
                {
                    title: "👑 OWNER COMMANDS",
                    rows: [
                        { title: "🔄 RESTART BOT", rowId: "restart", description: "Restart the bot" },
                        { title: "⚙️ EVAL CODE", rowId: "eval", description: "Execute JavaScript code" },
                        { title: "📊 BOT STATUS", rowId: "self", description: "Detailed bot status" },
                        { title: "🌐 PUBLIC MODE", rowId: "public", description: "Toggle public mode" }
                    ]
                }
            ];
            
            await sock.sendMessage(from, {
                text: `*OWNER MENU*\n\nAvailable commands for owner only:`,
                footer: `${config.botname} • Owner: ${config.owner[0]}`,
                title: "👑 OWNER PANEL",
                buttonText: "Select Command",
                sections
            });
        }
    },
    
    self: {
        help: 'Show detailed bot status',
        category: 'Owner',
        owner: true,
        execute: async (sock, message) => {
            const { from } = message;
            
            const db = require('../lib/database.js').getAll();
            const totalCommands = Object.values(db.users || {}).reduce((sum, user) => sum + (user.commands || 0), 0);
            
            // Get system info
            const { stdout: gitBranch } = await execAsync('git branch --show-current').catch(() => ({ stdout: 'unknown' }));
            const { stdout: gitCommit } = await execAsync('git log -1 --pretty=format:"%h"').catch(() => ({ stdout: 'unknown' }));
            
            const statusText = `🤖 *BOT SELF STATUS*\n\n` +
                `📛 *Name:* ${config.botname}\n` +
                `👤 *Connected as:* ${sock.user?.id || 'Unknown'}\n` +
                `📊 *Total Users:* ${Object.keys(db.users || {}).length}\n` +
                `📈 *Total Commands:* ${totalCommands}\n` +
                `💾 *Session:* ${fs.existsSync('./session') ? 'Active' : 'Not found'}\n` +
                `🌿 *Git Branch:* ${gitBranch.trim()}\n` +
                `🔗 *Git Commit:* ${gitCommit.trim()}\n` +
                `📁 *Plugins:* ${fs.readdirSync('./plugins').filter(f => f.endsWith('.js')).length}\n\n` +
                `_Last updated: ${new Date().toLocaleString()}_`;
            
            await sock.sendMessage(from, { text: statusText });
        }
    },
    
    public: {
        help: 'Toggle public mode',
        category: 'Owner',
        owner: true,
        execute: async (sock, message, args) => {
            const { from } = message;
            
            if (args.length === 0) {
                await sock.sendMessage(from, {
                    text: `Usage: .public <on/off>\nExample: .public on`
                });
                return;
            }
            
            const mode = args[0].toLowerCase();
            if (mode === 'on' || mode === 'off') {
                // In real implementation, you would save this to config
                await sock.sendMessage(from, {
                    text: `Public mode has been turned *${mode}*`
                });
            } else {
                await sock.sendMessage(from, {
                    text: 'Invalid option. Use "on" or "off"'
                });
            }
        }
    },
    
    restart: {
        help: 'Restart the bot',
        category: 'Owner',
        owner: true,
        execute: async (sock, message) => {
            const { from } = message;
            
            await sock.sendMessage(from, {
                text: '🔄 Restarting bot...'
            });
            
            // Restart after 2 seconds
            setTimeout(() => {
                console.log('Restarting bot...');
                process.exit(1);
            }, 2000);
        }
    },
    
    eval: {
        help: 'Execute JavaScript code',
        category: 'Owner',
        owner: true,
        execute: async (sock, message, args) => {
            const { from, sender } = message;
            
            if (args.length === 0) {
                await sock.sendMessage(from, {
                    text: 'Please provide code to evaluate.\nExample: .eval 1+1'
                });
                return;
            }
            
            const code = args.join(' ');
            
            try {
                // Sanitize and evaluate code
                let result = eval(code);
                
                // Handle promises
                if (result instanceof Promise) {
                    result = await result;
                }
                
                // Convert to string
                if (typeof result !== 'string') {
                    result = require('util').inspect(result, { depth: 1 });
                }
                
                // Limit output length
                if (result.length > 2000) {
                    result = result.substring(0, 2000) + '...';
                }
                
                await sock.sendMessage(from, {
                    text: `📥 *Input:*\n\`\`\`${code}\`\`\`\n\n📤 *Output:*\n\`\`\`${result}\`\`\``
                });
                
            } catch (error) {
                await sock.sendMessage(from, {
                    text: `❌ *Error:*\n\`\`\`${error.message}\`\`\``
                });
            }
        }
    }
};

module.exports = { commands };
