const { performance } = require('perf_hooks');
const os = require('os');
const { formatSize } = require('../lib/function.js');

const commands = {
    ping: {
        help: 'Check bot response time',
        category: 'Main',
        execute: async (sock, message) => {
            const start = performance.now();
            const msg = await sock.sendMessage(message.from, { text: 'Pong!' });
            const end = performance.now();
            const latency = (end - start).toFixed(2);
            
            await sock.sendMessage(message.from, {
                text: `🏓 Pong!\n\n📡 *Latency:* ${latency}ms\n⚡ *Speed:* Excellent`
            });
        }
    },
    
    speed: {
        help: 'Check bot speed',
        category: 'Main',
        execute: async (sock, message) => {
            const start = performance.now();
            
            // Perform a simple operation
            let operations = 0;
            for (let i = 0; i < 1000000; i++) {
                operations++;
            }
            
            const end = performance.now();
            const duration = (end - start).toFixed(2);
            
            // System info
            const totalMem = formatSize(os.totalmem());
            const freeMem = formatSize(os.freemem());
            const uptime = process.uptime();
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);
            
            const speedText = `⚡ *SPEED TEST*\n\n` +
                `📊 *Performance:* ${duration}ms for 1M ops\n` +
                `💾 *Memory Usage:* ${formatSize(process.memoryUsage().heapUsed)} / ${totalMem}\n` +
                `🆓 *Free Memory:* ${freeMem}\n` +
                `⏱️ *Process Uptime:* ${hours}h ${minutes}m ${seconds}s\n` +
                `👤 *Active Users:* ${Object.keys(require('../lib/database.js').getAll().users || {}).length}`;
            
            await sock.sendMessage(message.from, { text: speedText });
        }
    },
    
    runtime: {
        help: 'Show bot runtime information',
        category: 'Main',
        execute: async (sock, message) => {
            const uptime = process.uptime();
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);
            
            const db = require('../lib/database.js').getAll();
            const totalCommands = Object.values(db.users || {}).reduce((sum, user) => sum + (user.commands || 0), 0);
            const totalUsers = Object.keys(db.users || {}).length;
            const totalGroups = Object.keys(db.groups || {}).length;
            
            const runtimeText = `⏰ *RUNTIME INFO*\n\n` +
                `🕐 *Uptime:* ${hours}h ${minutes}m ${seconds}s\n` +
                `📊 *Total Commands:* ${totalCommands}\n` +
                `👤 *Total Users:* ${totalUsers}\n` +
                `👥 *Total Groups:* ${totalGroups}\n` +
                `📁 *Database Size:* ${formatSize(JSON.stringify(db).length)}\n` +
                `🚀 *Node.js:* ${process.version}\n` +
                `💻 *Platform:* ${process.platform}`;
            
            await sock.sendMessage(message.from, { text: runtimeText });
        }
    }
};

module.exports = { commands };
