const Discord = require('discord.js');
const Main = require('../index.js');

const Command = require('../objects/Command.js');

/**
 * fetches a command by name or alias
 * 
 * @param {String} name           the command name / alias 
 * @returns {Command | undefined} the command object
 */
function fetchCommand(name) {
    name = name.toLowerCase();
    const commandMap = Main.getCommandMap();

    for (const command of commandMap.values()) {
        // searches for the command name
        if (command.name === name) {
            return command;
        }

        // searches for the command alias
        for (const alias of command.aliases) {
            if (alias === name) {
                return command;
            }
        }
        
    }
}

module.exports = {
    name: 'help',
    aliases: ['helpme', 'how', '?', 'tasukete', 'tolong', 'request'],
    description: 'Shows the command list and its description',
    /**
     * executes the command
     * 
     * @param {Discord.Message} message  the message instance
     * @param {String[]} args            the arguments 
     */
    async execute(message, args) {
        const commandMap = Main.getCommandMap();

        const client = message.client;
        const member = message.member;

        if (args.length > 0) {
            const command = fetchCommand(args[0]);

            const embed = new Discord.RichEmbed()
                .setAuthor('Help command for ' + command.name)
                .setDescription(
                    '**Name:** `' + command.name + '`\n'
                    + '**Aliases:** `[' + command.aliases.join(', ') + ']`\n'
                    + '**Description:** `' + command.description + '`\n'
                )
                .setColor('RANDOM')
                .setFooter('Executed by ' + member.user.username, member.user.displayAvatarURL);

            message.channel.send(embed);
        }
        else {
            const embed = new Discord.RichEmbed()
                .setTitle('Command List')
                .setColor('RANDOM')
                .setThumbnail(client.user.displayAvatarURL)
                .setFooter('Executed by ' + member.user.username, member.user.displayAvatarURL);

            const commandList = [];
            let count = 1;

            for (const command of commandMap.values()) {
                commandList.push('**[' + count + ']** ' + Main.getPrefix() + command.name + ' - _' + command.description + '_');
                count++;
            }

            embed.setDescription(commandList.join('\n\n'));
            message.channel.send(embed);
        }

    }
}