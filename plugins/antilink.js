const db = require('../lib/database.js');
const config = require('../config.js');
const { getGroupAdmins } = require('../lib/jidUtils.js');

const commands = {
    antilink: {
        help: 'Toggle anti-link protection',
        category: 'Group',
        group: true,
        admin: true,
        execute: async (sock, message, args) => {
            const { from } = message;
            
            if (args.length === 0) {
                const settings = db.getGroupSettings(from);
                await sock.sendMessage(from, {
                    text: `Anti-link protection is currently *${settings.antilink ? 'ON' : 'OFF'}*\n\nUsage: .antilink <on/off>`
                });
                return;
            }
            
            const action = args[0].toLowerCase();
            if (action === 'on' || action === 'off') {
                db.setAntilink(from, action === 'on');
                await sock.sendMessage(from, {
                    text: `Anti-link protection has been turned *${action}*`
                });
            } else {
                await sock.sendMessage(from, {
                    text: 'Invalid option. Use "on" or "off"'
                });
            }
        }
    }
};

// Anti-link message handler
async function handleAntiLink(sock, message) {
    const { from, sender, body, isGroup } = message;
    
    if (!isGroup) return;
    
    const settings = db.getGroupSettings(from);
    if (!settings.antilink) return;
    
    // Check if sender is admin
    const admins = await getGroupAdmins(sock, from);
    if (admins.includes(sender)) return;
    
    // Check for URLs in message
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = body.match(urlRegex);
    
    if (urls) {
        // Check if URL is whitelisted
        const hasWhitelisted = urls.some(url => 
            config.antilink.whitelist.some(domain => url.includes(domain))
        );
        
        if (!hasWhitelisted) {
            // Take action based on config
            if (config.antilink.action === 'kick') {
                try {
                    await sock.groupParticipantsUpdate(from, [sender + '@s.whatsapp.net'], 'remove');
                    
                    // Notify group
                    await sock.sendMessage(from, {
                        text: `🚫 *ANTI-LINK SYSTEM*\n\n@${sender} has been kicked for sending links.\n\n⚠️ Links are not allowed in this group.`,
                        mentions: [sender + '@s.whatsapp.net']
                    });
                } catch (error) {
                    console.error('Failed to kick member:', error);
                }
            } else {
                // Warn the user
                await sock.sendMessage(from, {
                    text: `⚠️ *ANTI-LINK WARNING*\n\n@${sender}, please don't send links in this group.`,
                    mentions: [sender + '@s.whatsapp.net']
                });
                
                // Delete the message
                try {
                    await sock.sendMessage(from, {
                        delete: {
                            remoteJid: from,
                            fromMe: false,
                            id: message.message.key.id,
                            participant: sender + '@s.whatsapp.net'
                        }
                    });
                } catch (error) {
                    console.error('Failed to delete message:', error);
                }
            }
        }
    }
}

module.exports = { 
    commands,
    handleAntiLink 
};
