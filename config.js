module.exports = {
    // Bot Configuration
    botname: 'WhatsApp Bot MD',
    prefix: ['!', '.', '/', '#', '$'],
    owner: ['6281234567890'], // Your number
    sessionName: 'session',
    
    // API Configuration
    api: {
        joke: 'https://v2.jokeapi.dev/joke/Any',
        truth: 'https://api.truthordarebot.xyz/v1/truth',
        dare: 'https://api.truthordarebot.xyz/v1/dare',
        tiktok: 'https://api.tiklydown.eu.org/api/download?url=',
        instagram: 'https://api.igdownloader.app/api/ig',
        shortlink: 'https://tinyurl.com/api-create.php',
        ai: 'https://api.simsimi.net/v2/?text='
    },
    
    // Database Configuration
    database: './database.json',
    
    // Group Settings
    welcomeMessage: 'Welcome @user to @subject!\n\n@desc',
    goodbyeMessage: 'Goodbye @user!',
    
    // Auto Response
    autoRead: true,
    autoreply: {
        status: true,
        message: 'Hello, I am a WhatsApp bot. Type .menu to see available commands.'
    },
    
    // Anti Link
    antilink: {
        status: false,
        action: 'kick', // kick or warn
        whitelist: ['chat.whatsapp.com', 'github.com']
    },
    
    // Feature Toggles
    features: {
        welcome: true,
        goodbye: true,
        antilink: true,
        autoreply: true,
        sticker: true,
        download: true
    }
};
