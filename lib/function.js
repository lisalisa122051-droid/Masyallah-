// Fungsi utilitas umum
const config = require('../config');

const sendMenu = async (sock, jid, title, body, buttons = []) => {
    const buttonMessage = {
        text: body,
        footer: `${config.bot.name} v1.0.0`,
        buttons: buttons,
        headerType: 1
    };
    await sock.sendMessage(jid, buttonMessage);
};

const sendListMessage = async (sock, jid, title, body, sections) => {
    const listMessage = {
        text: body,
        footer: `${config.bot.name}`,
        title: title,
        buttonText: 'Pilih Menu',
        sections: sections
    };
    await sock.sendMessage(jid, listMessage);
};

module.exports = {
    sendMenu,
    sendListMessage
};
