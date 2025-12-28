const { isGroupJid, isOwner } = require('../lib/jidUtils.js');

module.exports = {
    commands: ['antilink'],
    description: 'Anti-link protection',
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    
    execute: async (client, m, args, text) => {
        const { from, sender, reply, isAdmin } = m;
        
        if (!m.isGroup) return;
        
        const command = m.body.split(' ')[0].toLowerCase().replace(global.prefix, '');
        
        if (command === 'antilink') {
            const status = args[0];
            if (!status || !['on', 'off'].includes(status)) {
                return reply('Usage: .antilink on/off');
            }
            
            global.db.settings = global.db.settings || {};
            global.db.settings.antilink = global.db.settings.antilink || {};
            global.db.settings.antilink[from] = status === 'on';
            
            await reply(`Anti-link turned *${status}*`);
        }
    }
};

// Additional event handler for anti-link (to be added in index.js)
function antiLinkHandler(client) {
    client.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        
        if (!isGroupJid(from)) return;
        
        // Check if anti-link is enabled for this group
        const antilinkEnabled = global.db.settings?.antilink?.[from];
        if (!antilinkEnabled) return;
        
        // Check if sender is admin or owner
        try {
            const metadata = await client.groupMetadata(from);
            const participant = metadata.participants.find(p => p.id === sender);
            if (participant?.admin === 'admin' || participant?.admin === 'superadmin') return;
        } catch {}
        
        // Detect links
        const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        const linkRegex = /(https?:\/\/[^\s]+)/gi;
        if (linkRegex.test(body)) {
            await client.sendMessage(from, {
                delete: {
                    remoteJid: from,
                    fromMe: false,
                    id: msg.key.id,
                    participant: sender
                }
            });
            
            await client.sendMessage(from, {
                text: `@${sender.split('@')[0]} sent a link!`,
                mentions: [sender]
            });
        }
    });
}

module.exports.antiLinkHandler = antiLinkHandler;
