/**
 * lib/database.js
 * Simple JSON file database with read/write helpers
 */

const fs = require('fs');
const path = require('path');
const config = require('../config');

const dbFile = path.resolve(config.databaseFile);
let _db = null;

function loadDatabaseSync() {
  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify({
      users: {},
      chats: {},
      groups: {},
      settings: {
        antilink: { enabled: false, kick: false },
        welcome: {}
      },
      owner: { number: config.ownerNumber }
    }, null, 2));
  }
  const raw = fs.readFileSync(dbFile, 'utf8');
  _db = JSON.parse(raw);
  return _db;
}

async function loadDatabase() {
  return loadDatabaseSync();
}

function readDB() {
  if (!_db) loadDatabaseSync();
  return _db;
}

function writeDB() {
  if (!_db) _db = {};
  fs.writeFileSync(dbFile, JSON.stringify(_db, null, 2));
}

function update(pathArray, value) {
  if (!_db) loadDatabaseSync();
  let cur = _db;
  for (let i = 0; i < pathArray.length - 1; i++) {
    const k = pathArray[i];
    if (!cur[k]) cur[k] = {};
    cur = cur[k];
  }
  cur[pathArray[pathArray.length - 1]] = value;
  writeDB();
}

module.exports = { loadDatabase, readDB, writeDB, update };
