const Discord = require('discord.js');
const Main = require('../index.js');

module.exports = {
    name: 'clear',
    aliases: [],
    description: 'Clears the messages with the specified number',
    /**
     * executes the command
     * 
     * @param {Discord.Message} message  the message instance
     * @param {String[]} args            the arguments 
     */
    async execute(message, args) {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) {
            return message.reply("You don't have the permission to do this!")
                .then(function (msg) {
                    if (msg.deletable) {
                        msg.delete(3000);
                    }
                });
        }
        if (args.length === 0) {
            return message.channel.send("Usage: " + Main.getPrefix() + this.name + " <size> - " + this.description);
        }

        if (!Main.isNumber(args[0])) {
            return message.channel.send("The size value must be number!")
        }

        const size = parseInt(args[0]);

        message.channel.bulkDelete(size, true)
            .catch(function (error) {
                if (error) {
                    message.channel.send("An error has occurred! \n\n" + error);
                }
            })
            .then(function (value) {
                if (!value) {
                    return;
                }

                message.channel.send("Messages has been cleared! (Total: " + size + ")");
            })
    }
};