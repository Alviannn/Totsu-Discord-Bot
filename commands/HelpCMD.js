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
    category: 'Information',
    /**
     * executes the command
     * 
     * @param {Discord.Message} message  the message instance
     * @param {String[]} args            the arguments 
     */
    async execute(message, args) {
        const commandMap = Main.getCommandMap();

        const client = message.client;

        if (args.length > 0) {
            const command = fetchCommand(args[0]);

            if (!command) {
                return message.channel.send('Cannot find any command or aliases like `' + args[0] + '`!')
            }

            const embed = new Discord.RichEmbed()
                .setAuthor('Help command for ' + command.name)
                .setDescription(
                    '**Name:** `' + command.name + '`\n'
                    + '**Aliases:** `[' + command.aliases.join(', ') + ']`\n'
                    + '**Description:** `' + command.description + '`\n'
                    + '**Category:** `' + command.category + '`'
                )
                .setColor('RANDOM')
                .setFooter('Executed by ' + message.author.username, message.author.displayAvatarURL);

            message.channel.send(embed);
        }
        else {
            const embed = new Discord.RichEmbed()
                .setAuthor('Command List')
                .setColor('RANDOM')
                .setThumbnail(client.user.displayAvatarURL)
                .setFooter('Executed by ' + message.author.username, message.author.displayAvatarURL);

            const commandList = {
                general: [],
                admin: [],
                developer: [],
                mute: []
            }

            for (const command of commandMap.values()) {
                if (command.group === 'General') {
                    commandList.general.push('`' + command.name + '`');
                }
                else if (command.group === 'Mute') {
                    commandList.mute.push('`' + command.name + '`');
                }
                else if (command.group === 'Admin') {
                    commandList.admin.push('`' + command.name + '`');
                }
                else if (command.group === 'Developer') {
                    commandList.developer.push('`' + command.name + '`');
                }
            }

            embed.setDescription(
                '**General**:'
                + '\n' + commandList.general.join(', ')
                + '\n\n'
                + '**Admin**:'
                + '\n' + commandList.admin.join(', ')
                + '\n\n'
                + '**Developer**:'
                + '\n' + commandList.developer.join(', ')
                + '\n\n'
                + '**Mute**:'
                + '\n' + commandList.mute.join(', ')
                + '\n\n '
                + 'Prefix: `' + Main.getPrefix() + '`' 
                + '\nSpecific command info: `' + Main.getPrefix() + this.name + ' <command>`'
            );
            message.channel.send(embed);
        }

    }
}