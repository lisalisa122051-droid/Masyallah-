// Color terminal
const color = (text, color) => {
    const colors = {
        black: '\x1b[30m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
        reset: '\x1b[0m'
    };
    return (colors[color] || colors.reset) + text + colors.reset;
};

// Check if string is URL
const isUrl = (str) => {
    const pattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    return pattern.test(str);
};

// Format bytes
const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

// Get random element from array
const getRandom = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
};

// Delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    color,
    isUrl,
    formatBytes,
    getRandom,
    delay
};
