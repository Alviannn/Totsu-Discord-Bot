const Discord = require('discord.js');

/**
 * fetches a user from a message
 * <p>
 * based on nickname and it's real username
 * 
 * @param {String} name         the name
 * @param {Discord.Guild} guild the discord guild (server)
 * @returns {Discord.User | null}      the fetched user
 */
function fetchUser(name, guild) {

    // fetches a user based on real username
    for (const member of guild.members.values()) {
        if (member.user.username === name) {
            return member.user;
        }
    }

    // fetches a user based on nickname / display name
    for (const member of guild.members.values()) {
        // based on nickname
        if (member.nickname === name) {
            return member.user;
        }
        // based on display name
        else if (member.displayName === name) {
            return member.user;
        }
    }

    return null;
}

module.exports = {
    name: 'showicon',
    aliases: ['icon'],
    description: 'Shows the icon of a user',
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
                .setImage(message.client.user.displayAvatarURL)
                .setDescription('This is my icon!');

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
                .setDescription('This is ' + mentionedUser.username + '\'s icon!');

            return message.channel.send(embed);
        }

        const fetchedUser = fetchUser(args[0], message.guild);
        if (!fetchedUser) {
            return message.channel.send('Cannot find `' + args[0] + '`!');
        }

        embed
            .setImage(fetchedUser.displayAvatarURL)
            .setDescription('This is ' + fetchedUser.username + '\'s icon!');

        message.channel.send(embed);
    }
}