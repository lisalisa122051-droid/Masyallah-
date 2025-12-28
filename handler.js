// Sistem handler dan plugin loader
const fs = require('fs');
const path = require('path');
const db = require('./lib/database');
const { isOwner } = require('./lib/jidUtils');
const config = require('./config');

let plugins = [];

const loadPlugins = async (sock) => {
    const pluginsDir = path.join(__dirname, 'plugins');
    plugins = [];

    fs.readdirSync(pluginsDir).forEach(file => {
        if (file.endsWith('.js')) {
            try {
                const plugin = require(path.join(pluginsDir, file));
                if (plugin.name && plugin.execute) {
                    plugins.push(plugin);
                }
            } catch (error) {
                console.error(`Error loading plugin ${file}:`, error);
            }
        }
    });

    console.log(`Loaded ${plugins.length} plugins`);

    // Event handler pesan
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;

        const serialized = require('./lib/serialize').serialize(sock, { messages: [m] });
        if (!serialized) return;

        await handleMessage(sock, serialized);
    });
};

const handleMessage = async (sock, m) => {
    // Cari plugin yang cocok
    for (const plugin of plugins) {
        if (plugin.pattern.test(m.body) && 
            (!plugin.adminOnly || await checkPermission(sock, m, plugin.adminOnly)) &&
            (!plugin.ownerOnly || isOwner(m.sender, config.bot.owner))) {
            
            try {
                await plugin.execute(sock, m);
                return; // Hanya execute satu plugin pertama yang match
            } catch (error) {
                console.error(`Error executing plugin ${plugin.name}:`, error);
                await sock.sendMessage(m.from, { 
                    text: `❌ Error: ${error.message}` 
                });
            }
        }
    }
};

const checkPermission = async (sock, m, level = 'admin') => {
    if (!m.isGroup) return true;
    // Implementasi pengecekan admin disini
    return true; // Simplified untuk pembelajaran
};

module.exports = { loadPlugins };
