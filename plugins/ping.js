const { color } = require('../lib/function.js');
const moment = require('moment-timezone');

module.exports = {
    commands: ['ping', 'speed', 'runtime'],
    description: 'Check bot speed and runtime',
    
    execute: async (client, m, args, text) => {
        const { reply } = m;
        const start = Date.now();
        const timestamp = moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss');
        
        if (m.body.includes('ping')) {
            await reply('*Pong!* 🏓');
            const latency = Date.now() - start;
            await reply(`*Speed:* ${latency} ms\n*Time:* ${timestamp}`);
        } else if (m.body.includes('speed')) {
            const latency = Date.now() - start;
            await reply(`*Response Speed:* ${latency} ms\n*Server:* ${process.platform}\n*Memory:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`);
        } else if (m.body.includes('runtime')) {
            const uptime = process.uptime();
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);
            await reply(`*Uptime:* ${hours}h ${minutes}m ${seconds}s\n*Since:* ${new Date(Date.now() - (uptime * 1000)).toLocaleString()}`);
        }
    }
};
