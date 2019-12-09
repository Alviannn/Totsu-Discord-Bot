const Discord = require('discord.js');
const Main = require('../index.js');

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

        const embed = new Discord.RichEmbed()
            .setTitle('Command List')
            .setColor('RANDOM')
            .setThumbnail(Main.getClient().user.displayAvatarURL)
            .setFooter('Executed by ' + message.member.user.username, message.member.user.displayAvatarURL);

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