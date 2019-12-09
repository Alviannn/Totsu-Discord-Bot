const Main = require('../index.js');

module.exports = {
    eventId: 'ready',
    async call() {
        // sets the bot presence
        const client = Main.getClient();

        client.user.setPresence({
            status: 'online',
            game: {
                type: 'WATCHING',
                name: 'Type ' + Main.getPrefix() + 'help'
            }
        });
    }
}