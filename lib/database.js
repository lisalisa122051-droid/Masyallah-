const fs = require('fs-extra');
const path = require('path');
const config = require('../config.js');

class Database {
    constructor() {
        this.filePath = config.database;
        this.data = this.load();
    }
    
    load() {
        try {
            if (fs.existsSync(this.filePath)) {
                const content = fs.readFileSync(this.filePath, 'utf8');
                return JSON.parse(content);
            }
            return {};
        } catch (error) {
            console.error('Error loading database:', error);
            return {};
        }
    }
    
    save() {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
            return true;
        } catch (error) {
            console.error('Error saving database:', error);
            return false;
        }
    }
    
    // Group settings
    getGroupSettings(groupId) {
        if (!this.data.groups) this.data.groups = {};
        if (!this.data.groups[groupId]) {
            this.data.groups[groupId] = {
                welcome: true,
                goodbye: true,
                antilink: false,
                mutelink: false
            };
        }
        return this.data.groups[groupId];
    }
    
    updateGroupSettings(groupId, settings) {
        if (!this.data.groups) this.data.groups = {};
        this.data.groups[groupId] = { ...this.getGroupSettings(groupId), ...settings };
        this.save();
    }
    
    // User data
    getUserData(userId) {
        if (!this.data.users) this.data.users = {};
        if (!this.data.users[userId]) {
            this.data.users[userId] = {
                commands: 0,
                lastSeen: Date.now()
            };
        }
        return this.data.users[userId];
    }
    
    updateUserData(userId, data) {
        if (!this.data.users) this.data.users = {};
        this.data.users[userId] = { ...this.getUserData(userId), ...data };
        this.save();
    }
    
    // Command stats
    incrementCommand(userId) {
        const user = this.getUserData(userId);
        user.commands = (user.commands || 0) + 1;
        user.lastSeen = Date.now();
        this.save();
    }
    
    // Anti-link
    setAntilink(groupId, status) {
        const settings = this.getGroupSettings(groupId);
        settings.antilink = status;
        this.updateGroupSettings(groupId, settings);
    }
    
    // Welcome
    setWelcome(groupId, status) {
        const settings = this.getGroupSettings(groupId);
        settings.welcome = status;
        this.updateGroupSettings(groupId, settings);
    }
    
    // Goodbye
    setGoodbye(groupId, status) {
        const settings = this.getGroupSettings(groupId);
        settings.goodbye = status;
        this.updateGroupSettings(groupId, settings);
    }
    
    // Get all data
    getAll() {
        return this.data;
    }
}

module.exports = new Database();
