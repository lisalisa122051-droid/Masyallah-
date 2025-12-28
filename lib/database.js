// Database JSON sederhana untuk pembelajaran
const fs = require('fs');
const config = require('../config');

class Database {
    constructor() {
        this.file = config.database.file;
        this.data = this.load();
    }

    load() {
        try {
            if (fs.existsSync(this.file)) {
                return JSON.parse(fs.readFileSync(this.file, 'utf8'));
            }
            return {};
        } catch {
            return {};
        }
    }

    save() {
        try {
            fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
        } catch (error) {
            console.error('Error saving database:', error);
        }
    }

    get(key, defaultValue = null) {
        return this.data[key] ?? defaultValue;
    }

    set(key, value) {
        this.data[key] = value;
        this.save();
    }

    push(key, value) {
        if (!this.data[key]) this.data[key] = [];
        this.data[key].push(value);
        this.save();
    }
}

module.exports = new Database();
