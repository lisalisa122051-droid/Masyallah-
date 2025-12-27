const { Boom } = require('@hapi/boom');

module.exports = {
    // Connection utilities
    isConnected: (sock) => {
        return sock.user && sock.user.id;
    },
    
    reconnect: async (sock) => {
        try {
            await sock.ws.close();
            return true;
        } catch (error) {
            console.error('Reconnection error:', error);
            return false;
        }
    },
    
    getBotInfo: (sock) => {
        return {
            id: sock.user?.id,
            name: sock.user?.name,
            phone: sock.user?.phone
        };
    }
};
