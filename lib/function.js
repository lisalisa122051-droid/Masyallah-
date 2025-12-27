const fs = require('fs');
const path = require('path');
const axios = require('axios');
const moment = require('moment');
const FormData = require('form-data');

// Format time
function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
}

// Format size
function formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Download file
async function downloadFile(url, filename) {
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });
        
        const writer = fs.createWriteStream(filename);
        response.data.pipe(writer);
        
        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(filename));
            writer.on('error', reject);
        });
    } catch (error) {
        throw new Error(`Download failed: ${error.message}`);
    }
}

// Generate random
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Pick random from array
function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Wait
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Check if URL is valid
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Get buffer from URL
async function getBuffer(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary');
    } catch (error) {
        throw new Error(`Failed to get buffer: ${error.message}`);
    }
}

// Format date
function formatDate(date, format = 'DD/MM/YYYY HH:mm:ss') {
    return moment(date).format(format);
}

// Parse mention
function parseMention(text) {
    const mentionRegex = /@([0-9]{5,})/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
        mentions.push(match[1] + '@s.whatsapp.net');
    }
    
    return mentions;
}

// Create serial number
function generateSerial() {
    return 'xxxx-xxxx-xxxx-xxxx'.replace(/x/g, () => {
        return Math.floor(Math.random() * 16).toString(16);
    }).toUpperCase();
}

module.exports = {
    formatTime,
    formatSize,
    downloadFile,
    random,
    pickRandom,
    sleep,
    isValidUrl,
    getBuffer,
    formatDate,
    parseMention,
    generateSerial
};
