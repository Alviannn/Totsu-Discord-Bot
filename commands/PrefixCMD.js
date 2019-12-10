const Discord = require('discord.js');
const Main = require('../index.js');

module.exports = {
    name: 'prefix',
    aliases: ['serverprefix', 'botprefix', 'pref'],
    description: 'Sends the prefix info (and maybe change it if you have the access?)',
    /**
     * executes the command
     * 
     * @param {Discord.Message} message  the message instance
     * @param {String[]} args            the arguments 
     */
    async execute(message, args) {
        if (args.length === 0) {
            return message.channel.send("My current prefix is `" + Main.getPrefix() + "`!");
        }

        const member = message.member;
        if (!member.hasPermission('MANAGE_GUILD') && !member.hasPermission('ADMINISTRATOR')) {
            return message.channel.send("You don't have the permission to do this!")
                .then(msg => msg.delete(3000));
        }

        const client = Main.getClient();
        const config = Main.getConfig();

        config['prefix'] = args[0];

        Main.saveConfig(config);

        client.user.setPresence({
            status: 'online',
            game: {
                type: 'WATCHING',
                name: 'Type ' + Main.getPrefix() + 'help'
            }
        });

        message.channel.send('The bot prefix has been changed to `' + Main.getPrefix() + '`!');
    }
}