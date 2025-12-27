/**
 * index.js
 * Entrypoint for bot-wa-md
 */

const { startConnection } = require('./lib/connection');
const handler = require('./handler');
const { loadDatabase } = require('./lib/database');

(async () => {
  // Load DB
  await loadDatabase();

  // Start connection and pass handler
  const { sock, ev } = await startConnection(handler);

  // Keep process alive
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception', err);
  });

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection', err);
  });

  console.log('Bot is running...');
})();
