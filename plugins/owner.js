const { exec } = require('child_process');
const { isOwner } = require('../lib/jidUtils.js');
const config = require('../config.js');

module.exports = {
    commands: ['owner', 'self', 'public', 'restart', 'eval'],
    description: 'Owner commands',
    ownerOnly: true,
    
    execute: async (client, m, args, text) => {
        const { sender, from, reply } = m;
        
        if (m.body.includes('owner')) {
            await reply(`*Owner Contacts:*\n${global.owner.map((o, i) => `${i+1}. @${o.replace('62', '')}`).join('\n')}`);
        } else if (m.body.includes('self')) {
            config.self = true;
            await reply('*Mode:* Self (only owner can use bot)');
        } else if (m.body.includes('public')) {
            config.self = false;
            await reply('*Mode:* Public (all users can use bot)');
        } else if (m.body.includes('restart')) {
            await reply('*Restarting bot...*');
            setTimeout(() => {
                process.exit(1);
            }, 2000);
        } else if (m.body.includes('eval')) {
            if (!text) return reply('Provide code to evaluate.');
            try {
                let evaled = await eval(text);
                if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
                await reply(evaled.substring(0, 3000));
            } catch (error) {
                await reply(`*Error:* ${error.message}`);
            }
        }
    }
};
