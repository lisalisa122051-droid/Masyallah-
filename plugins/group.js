const config = require('../config.js');
const db = require('../lib/database.js');
const { getGroupAdmins } = require('../lib/jidUtils.js');

const commands = {
    welcome: {
        help: 'Toggle welcome message',
        category: 'Group',
        group: true,
        admin: true,
        execute: async (sock, message, args) => {
            const { from } = message;
            
            if (args.length === 0) {
                const settings = db.getGroupSettings(from);
                await sock.sendMessage(from, {
                    text: `Welcome message is currently *${settings.welcome ? 'ON' : 'OFF'}*\n\nUsage: .welcome <on/off>`
                });
                return;
            }
            
            const action = args[0].toLowerCase();
            if (action === 'on' || action === 'off') {
                db.setWelcome(from, action === 'on');
                await sock.sendMessage(from, {
                    text: `Welcome message has been turned *${action}*`
                });
            } else {
                await sock.sendMessage(from, {
                    text: 'Invalid option. Use "on" or "off"'
                });
            }
        }
    },
    
    setname: {
        help: 'Change group name',
        category: 'Group',
        group: true,
        admin: true,
        execute: async (sock, message, args) => {
            const { from } = message;
            
            if (args.length === 0) {
                await sock.sendMessage(from, {
                    text: 'Please provide new group name.\nExample: .setname Bot Group'
                });
                return;
            }
            
            const newName = args.join(' ');
            
            try {
                await sock.groupUpdateSubject(from, newName);
                await sock.sendMessage(from, {
                    text: `✅ Group name changed to: *${newName}*`
                });
            } catch (error) {
                await sock.sendMessage(from, {
                    text: `❌ Failed to change group name: ${error.message}`
                });
            }
        }
    },
    
    setdesc: {
        help: 'Change group description',
        category: 'Group',
        group: true,
        admin: true,
        execute: async (sock, message, args) => {
            const { from } = message;
            
            if (args.length === 0) {
                await sock.sendMessage(from, {
                    text: 'Please provide new group description.\nExample: .setdesc This is a cool group'
                });
                return;
            }
            
            const newDesc = args.join(' ');
            
            try {
                await sock.groupUpdateDescription(from, newDesc);
                await sock.sendMessage(from, {
                    text: `✅ Group description updated`
                });
            } catch (error) {
                await sock.sendMessage(from, {
                    text: `❌ Failed to update description: ${error.message}`
                });
            }
        }
    },
    
    open: {
        help: 'Open group (allow everyone to send messages)',
        category: 'Group',
        group: true,
        admin: true,
        execute: async (sock, message) => {
            const { from } = message;
            
            try {
                await sock.groupSettingUpdate(from, 'not_announcement');
                await sock.sendMessage(from, {
                    text: '✅ Group has been opened'
                });
            } catch (error) {
                await sock.sendMessage(from, {
                    text: `❌ Failed to open group: ${error.message}`
                });
            }
        }
    },
    
    close: {
        help: 'Close group (only admins can send messages)',
        category: 'Group',
        group: true,
        admin: true,
        execute: async (sock, message) => {
            const { from } = message;
            
            try {
                await sock.groupSettingUpdate(from, 'announcement');
                await sock.sendMessage(from, {
                    text: '✅ Group has been closed'
                });
            } catch (error) {
                await sock.sendMessage(from, {
                    text: `❌ Failed to close group: ${error.message}`
                });
            }
        }
    },
    
    kick: {
        help: 'Kick member from group',
        category: 'Group',
        group: true,
        admin: true,
        execute: async (sock, message, args) => {
            const { from, quoted } = message;
            
            let target = args[0];
            
            // If replying to a message
            if (!target && quoted) {
                target = quoted.sender;
            }
            
            if (!target) {
                await sock.sendMessage(from, {
                    text: 'Please mention or reply to the user you want to kick.\nExample: .kick @user'
                });
                return;
            }
            
            // Extract mentioned users
            const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            
            try {
                if (mentionedJid.length > 0) {
                    for (const jid of mentionedJid) {
                        await sock.groupParticipantsUpdate(from, [jid], 'remove');
                    }
                    await sock.sendMessage(from, {
                        text: `✅ Successfully kicked ${mentionedJid.length} member(s)`
                    });
                } else if (target.includes('@')) {
                    await sock.groupParticipantsUpdate(from, [target], 'remove');
                    await sock.sendMessage(from, {
                        text: '✅ Member kicked successfully'
                    });
                } else {
                    await sock.sendMessage(from, {
                        text: 'Please mention a valid user with @'
                    });
                }
            } catch (error) {
                await sock.sendMessage(from, {
                    text: `❌ Failed to kick member: ${error.message}`
                });
            }
        }
    },
    
    add: {
        help: 'Add user to group',
        category: 'Group',
        group: true,
        admin: true,
        execute: async (sock, message, args) => {
            const { from } = message;
            
            if (args.length === 0) {
                await sock.sendMessage(from, {
                    text: 'Please provide phone number to add.\nExample: .add 6281234567890'
                });
                return;
            }
            
            const phone = args[0].replace(/[^0-9]/g, '');
            const jid = `${phone}@s.whatsapp.net`;
            
            try {
                await sock.groupParticipantsUpdate(from, [jid], 'add');
                await sock.sendMessage(from, {
                    text: `✅ Invitation sent to ${phone}`
                });
            } catch (error) {
                await sock.sendMessage(from, {
                    text: `❌ Failed to add user: ${error.message}`
                });
            }
        }
    },
    
    promote: {
        help: 'Promote member to admin',
        category: 'Group',
        group: true,
        admin: true,
        execute: async (sock, message, args) => {
            const { from, quoted } = message;
            
            let target = args[0];
            
            // If replying to a message
            if (!target && quoted) {
                target = quoted.sender;
            }
            
            if (!target) {
                await sock.sendMessage(from, {
                    text: 'Please mention or reply to the user you want to promote.\nExample: .promote @user'
                });
                return;
            }
            
            const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            
            try {
                if (mentionedJid.length > 0) {
                    for (const jid of mentionedJid) {
                        await sock.groupParticipantsUpdate(from, [jid], 'promote');
                    }
                    await sock.sendMessage(from, {
                        text: `✅ Successfully promoted ${mentionedJid.length} member(s)`
                    });
                } else if (target.includes('@')) {
                    await sock.groupParticipantsUpdate(from, [target], 'promote');
                    await sock.sendMessage(from, {
                        text: '✅ Member promoted to admin'
                    });
                } else {
                    await sock.sendMessage(from, {
                        text: 'Please mention a valid user with @'
                    });
                }
            } catch (error) {
                await sock.sendMessage(from, {
                    text: `❌ Failed to promote member: ${error.message}`
                });
            }
        }
    },
    
    demote: {
        help: 'Demote admin to member',
        category: 'Group',
        group: true,
        admin: true,
        execute: async (sock, message, args) => {
            const { from, quoted } = message;
            
            let target = args[0];
            
            // If replying to a message
            if (!target && quoted) {
                target = quoted.sender;
            }
            
            if (!target) {
                await sock.sendMessage(from, {
                    text: 'Please mention or reply to the admin you want to demote.\nExample: .demote @user'
                });
                return;
            }
            
            const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            
            try {
                if (mentionedJid.length > 0) {
                    for (const jid of mentionedJid) {
                        await sock.groupParticipantsUpdate(from, [jid], 'demote');
                    }
                    await sock.sendMessage(from, {
                        text: `✅ Successfully demoted ${mentionedJid.length} admin(s)`
                    });
                } else if (target.includes('@')) {
                    await sock.groupParticipantsUpdate(from, [target], 'demote');
                    await sock.sendMessage(from, {
                        text: '✅ Admin demoted to member'
                    });
                } else {
                    await sock.sendMessage(from, {
                        text: 'Please mention a valid user with @'
                    });
                }
            } catch (error) {
                await sock.sendMessage(from, {
                    text: `❌ Failed to demote admin: ${error.message}`
                });
            }
        }
    }
};

// Group event handlers
async function handleGroupJoin(sock, participants, id) {
    const settings = db.getGroupSettings(id);
    
    if (settings.welcome && participants.includes('add')) {
        try {
            const metadata = await sock.groupMetadata(id);
            const memberCount = metadata.participants.length;
            
            // Find new members
            const newMembers = participants.filter(p => p.action === 'add').map(p => p.id);
            
            for (const newMember of newMembers) {
                const welcomeText = config.welcomeMessage
                    .replace('@user', `@${newMember.split('@')[0]}`)
                    .replace('@subject', metadata.subject)
                    .replace('@desc', metadata.desc || 'No description')
                    .replace('@count', memberCount);
                
                await sock.sendMessage(id, {
                    text: welcomeText,
                    mentions: [newMember]
                });
            }
        } catch (error) {
            console.error('Welcome error:', error);
        }
    }
}

async function handleGroupLeave(sock, participants, id) {
    const settings = db.getGroupSettings(id);
    
    if (settings.goodbye && participants.includes('remove')) {
        try {
            const metadata = await sock.groupMetadata(id);
            const memberCount = metadata.participants.length;
            
            // Find leaving members
            const leavingMembers = participants.filter(p => p.action === 'remove').map(p => p.id);
            
            for (const leavingMember of leavingMembers) {
                const goodbyeText = config.goodbyeMessage
                    .replace('@user', `@${leavingMember.split('@')[0]}`)
                    .replace('@subject', metadata.subject)
                    .replace('@count', memberCount);
                
                await sock.sendMessage(id, {
                    text: goodbyeText,
                    mentions: [leavingMember]
                });
            }
        } catch (error) {
            console.error('Goodbye error:', error);
        }
    }
}

module.exports = { 
    commands,
    handleGroupJoin,
    handleGroupLeave 
};
