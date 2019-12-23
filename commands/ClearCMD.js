const Discord = require('discord.js');
const Main = require('../index.js');

/**
 * fetches the messages
 * 
 * @param {Discord.Message} message the message instance
 * @param {Number} limit            the limit 
 * @returns {Discord.Message | Discord.Collection<string, Discord.Message> |Discord. Message[]} the retrieved message(s)
 */
async function fetchMessages(message, limit) {
    let retrievedValue;

    await message.channel.fetchMessages({limit: limit})
        .catch(error => {
            if (error) {
                return message.channel.send('Failed to fetch the messages! \n ```\n' + error + '```');
            }
        })
        .then(value => {
            if (!value) {
                return message.channel.send('Failed to fetch the messages!');
            }

            retrievedValue = value;
        });

    return retrievedValue;
}

module.exports = {
    name: 'clear',
    aliases: [],
    description: 'Clears the messages with the specified number',
    group: 'Admin',
    category: 'Moderation',
    /**
     * executes the command
     * 
     * @param {Discord.Message} message  the message instance
     * @param {String[]} args            the arguments 
     */
    async execute(message, args) {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) {
            return Main.sendNoPerm(message);
        }
        if (args.length === 0) {
            return message.channel.send("Usage: " + Main.getPrefix() + this.name + " <size> - " + this.description);
        }

        // checks if the argument is a number
        if (!Main.isNumber(args[0])) {
            return message.channel.send("The size value must be number!")
        }

        const size = parseInt(args[0]);
        const messages = await fetchMessages(message, size, message.content);

        if (!messages || messages.size === 0) {
           return message.channel.send('Failed to fetch the messages!');
        }

        message.channel.bulkDelete(messages, true)
            .catch(error => {
                if (error) {
                    return message.channel.send('Failed to delete the messages! \n\n' + error);
               }
            })
            .then(messageList => {
                const embed = new Discord.RichEmbed()
                    .setDescription('Total of ' + messageList.size + ' message(s) has been cleared!')
                    .setColor('RANDOM');

                return message.channel.send(embed);
            });
    }
};