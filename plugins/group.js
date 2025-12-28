const { isGroupJid } = require('../lib/jidUtils.js');

module.exports = {
    commands: ['welcome', 'setname', 'setdesc', 'open', 'close', 'kick', 'add', 'promote', 'demote'],
    description: 'Group management',
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    
    execute: async (client, m, args, text) => {
        const { from, sender, reply, isAdmin } = m;
        
        if (!m.isGroup) return reply('This command only works in groups.');
        if (!m.isBotAdmin) return reply('I need to be admin to do that.');
        
        const command = m.body.split(' ')[0].toLowerCase().replace(global.prefix, '');
        
        switch (command) {
            case 'welcome':
                const status = args[0];
                if (!status || !['on', 'off'].includes(status)) {
                    return reply('Usage: .welcome on/off');
                }
                global.db.groups = global.db.groups || {};
                global.db.groups[from] = global.db.groups[from] || {};
                global.db.groups[from].welcome = status === 'on';
                await reply(`Welcome message turned *${status}*`);
                break;
                
            case 'setname':
                if (!text) return reply('Provide new group name.');
                await client.groupUpdateSubject(from, text);
                await reply(`Group name changed to: *${text}*`);
                break;
                
            case 'setdesc':
                if (!text) return reply('Provide new group description.');
                await client.groupUpdateDescription(from, text);
                await reply(`Group description updated.`);
                break;
                
            case 'open':
                await client.groupSettingUpdate(from, 'not_announcement');
                await reply('Group opened for all members.');
                break;
                
            case 'close':
                await client.groupSettingUpdate(from, 'announcement');
                await reply('Group closed (only admins can send).');
                break;
                
            case 'kick':
                if (!m.mentionedJid && !text) return reply('Tag user or provide number.');
                const kickTarget = m.mentionedJid ? m.mentionedJid[0] : text + '@s.whatsapp.net';
                await client.groupParticipantsUpdate(from, [kickTarget], 'remove');
                await reply('User kicked.');
                break;
                
            case 'add':
                if (!text) return reply('Provide number (628xxx).');
                const num = text.replace(/\D/g, '');
                if (!num.startsWith('62')) return reply('Invalid Indonesian number.');
                await client.groupParticipantsUpdate(from, [`${num}@s.whatsapp.net`], 'add');
                await reply('User added.');
                break;
                
            case 'promote':
                if (!m.mentionedJid) return reply('Tag user to promote.');
                await client.groupParticipantsUpdate(from, [m.mentionedJid[0]], 'promote');
                await reply('User promoted to admin.');
                break;
                
            case 'demote':
                if (!m.mentionedJid) return reply('Tag user to demote.');
                await client.groupParticipantsUpdate(from, [m.mentionedJid[0]], 'demote');
                await reply('User demoted from admin.');
                break;
        }
    }
};
