const Main = require('../index.js');

module.exports = {
    eventId: 'ready',
    async call() {
        Main.setSimplePresence('online', 'PLAYING', 'Type ' + Main.getPrefix() + 'help');

        console.log('Bot started in ' + (new Date().getTime() - Main.startTime()) + 'ms');
    }
}