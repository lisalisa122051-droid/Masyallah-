const fs = require('fs');
const path = require('path');
const { color, isUrl } = require('./lib/function.js');
const { isGroupJid, isOwner } = require('./lib/jidUtils.js');
const config = require('./config.js');

// Load all plugins
const plugins = {};
const pluginDir = path.join(__dirname, 'plugins');
const pluginFiles = fs.readdirSync(pluginDir).filter(file => file.endsWith('.js'));

for (const file of pluginFiles) {
    const plugin = require(path.join(pluginDir, file));
    plugins[file.replace('.js', '')] = plugin;
    console.log(color(`✓ Plugin loaded: ${file}`, 'green'));
}

module.exports = async (client, m) => {
    const { body, sender, from, isGroup, isBotAdmin, isAdmin, reply } = m;
    if (!body || body.length < 2) return;
    
    // Parse command
    const isCmd = body.startsWith(config.prefix);
    if (!isCmd) return;
    
    const args = body.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const text = args.join(' ');
    
    // Check if command exists
    let found = false;
    for (const [pluginName, plugin] of Object.entries(plugins)) {
        if (plugin.commands && plugin.commands.includes(command)) {
            found = true;
            
            // Permission checks
            if (plugin.ownerOnly && !isOwner(sender)) {
                return reply(config.messages.ownerOnly);
            }
            if (plugin.groupOnly && !isGroup) {
                return reply(config.messages.groupOnly);
            }
            if (plugin.adminOnly && isGroup && !isAdmin) {
                return reply(config.messages.adminOnly);
            }
            if (plugin.botAdminOnly && isGroup && !isBotAdmin) {
                return reply(config.messages.botAdmin);
            }
            
            // Execute command
            try {
                await plugin.execute(client, m, args, text);
            } catch (error) {
                console.error(error);
                reply(config.messages.error);
            }
            break;
        }
    }
    
    if (!found) {
        // Optional: unknown command handler
        // reply(`Command *${command}* not found. Type *.menu* for list.`);
    }
};
