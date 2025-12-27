const fs = require('fs');
const path = require('path');
const config = require('./config.js');
const { isOwner, isGroup, getGroupAdmins } = require('./lib/jidUtils.js');
const db = require('./lib/database.js');

// Load all plugins
const plugins = {};
const pluginFiles = fs.readdirSync('./plugins').filter(file => file.endsWith('.js'));

for (const file of pluginFiles) {
    const pluginName = file.replace('.js', '');
    plugins[pluginName] = require(`./plugins/${file}`);
}

// Main handler
async function handler(sock, message) {
    try {
        const { body, from, sender, isGroup, isOwner, command, args, isCmd } = message;
        
        // Skip if not a command
        if (!isCmd) {
            // Auto reply
            if (config.autoreply.status && !isGroup) {
                const autoReply = config.autoreply.message;
                await sock.sendMessage(from, { text: autoReply });
            }
            return;
        }
        
        // Check if command exists
        let commandFound = false;
        
        // Search command in all plugins
        for (const pluginName in plugins) {
            const plugin = plugins[pluginName];
            if (plugin.commands && plugin.commands[command]) {
                const cmdConfig = plugin.commands[command];
                
                // Check permissions
                if (cmdConfig.owner && !isOwner) {
                    await sock.sendMessage(from, { text: 'This command is for owner only!' });
                    return;
                }
                
                if (cmdConfig.group && !isGroup) {
                    await sock.sendMessage(from, { text: 'This command only works in groups!' });
                    return;
                }
                
                if (cmdConfig.admin && isGroup) {
                    const groupAdmins = await getGroupAdmins(sock, from);
                    if (!groupAdmins.includes(sender)) {
                        await sock.sendMessage(from, { text: 'This command is for admin only!' });
                        return;
                    }
                }
                
                // Execute command
                await plugin.commands[command].execute(sock, message, args);
                commandFound = true;
                break;
            }
        }
        
        // Command not found
        if (!commandFound) {
            await sock.sendMessage(from, { 
                text: `Command "${command}" not found. Type .menu to see available commands.` 
            });
        }
        
    } catch (error) {
        console.error('Handler error:', error);
        await sock.sendMessage(message.from, { 
            text: 'An error occurred while processing your command.' 
        });
    }
}

module.exports = handler;
