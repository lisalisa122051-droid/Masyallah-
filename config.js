/**
 * config.js
 * Basic configuration and owner definition
 */

module.exports = {
  ownerNumber: '6281234567890', // change to your number in normalized format (without @s.whatsapp.net)
  prefix: '.',
  sessionPath: './session',
  databaseFile: './database.json',
  botName: 'BotWA-MD',
  version: '1.0.1',
  welcomeMessage: 'Selamat datang di grup!',
  goodbyeMessage: 'Sampai jumpa!',
  antiLink: {
    enabled: false,
    kick: false
  }
};
