const Discord = require('discord.js');
const Main = require('../index.js');

module.exports = {
    name: 'showicon',
    aliases: ['icon', 'avatar', 'image'],
    description: 'Shows the icon of a user',
    category: 'Fun',
    /**
     * executes the command
     * 
     * @param {Discord.Message} message  the message instance
     * @param {String[]} args            the arguments 
     */
    async execute(message, args) {
        const embed = new Discord.RichEmbed().setColor('RANDOM');

        if (args.length === 0) {
            embed
                .setImage(message.author.displayAvatarURL)
                .setDescription('This is your avatar!');

            return message.channel.send(embed);
        }
        if (args[0] === 'server') {
            embed
                .setImage(message.guild.iconURL)
                .setDescription('This is the server\'s icon!');

            return message.channel.send(embed);
        }

        let mentionedUser = message.mentions.users.first();
        if (mentionedUser) {
            embed
                .setImage(mentionedUser.displayAvatarURL)
                .setDescription('This is ' + mentionedUser.username + '\'s avatar!');

            return message.channel.send(embed);
        }

        let fetchedUser = Main.findMember(args[0], message.guild);
        if (!fetchedUser) {
            return message.channel.send('Cannot find `' + args[0] + '`!');
        }

        fetchedUser = fetchedUser.user;
        embed
            .setImage(fetchedUser.displayAvatarURL)
            .setDescription('This is ' + fetchedUser.username + '\'s avatar!');

        message.channel.send(embed);
    }
}