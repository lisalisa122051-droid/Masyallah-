const fs = require('fs');
const path = require('path');
const config = require('../config.js');

const dbPath = path.join(__dirname, '..', config.databaseFile);

// Default database structure
const defaultDB = {
    users: {},
    groups: {},
    settings: {
        antilink: {},
        welcome: {}
    },
    stats: {
        commands: 0,
        messages: 0
    }
};

// Load database
function loadDatabase() {
    if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify(defaultDB, null, 2));
        return defaultDB;
    }
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading database:', error);
        return defaultDB;
    }
}

// Save database
function saveDatabase(db) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    } catch (error) {
        console.error('Error saving database:', error);
    }
}

module.exports = { loadDatabase, saveDatabase };
