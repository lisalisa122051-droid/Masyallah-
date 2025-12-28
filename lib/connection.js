// Manajemen session dan koneksi Baileys
const { useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { existsSync, mkdirSync } = require('fs');
const config = require('../config');

const useMultiFileAuthStateLocal = async (folder) => {
    // Pastikan folder session ada
    if (!existsSync(folder)) {
        mkdirSync(folder, { recursive: true });
    }
    
    const { state, saveCreds } = await useMultiFileAuthState(folder);
    
    return {
        state,
        saveCreds: (update) => {
            saveCreds(update);
        }
    };
};

module.exports = {
    useMultiFileAuthState: useMultiFileAuthStateLocal
};
