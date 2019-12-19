const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'changelog',
    aliases: ['viewchanges', 'updates', 'changes'],
    description: 'Sends the changelog that has been committed recently',
    category: 'Information',
    /**
     * executes the command
     * 
     * @param {Discord.Message} message  the message instance
     * @param {String[]} args            the arguments 
     */
    async execute(message, args) {
        if (!fs.existsSync('./changelog.txt')) {
            return message.channel.send('Failed to read the changelog file!');
        }

        const contentFile = fs.readFileSync('./changelog.txt', {encoding: 'utf8'});
        if (!contentFile) {
            return message.channel.send('Failed to read the changelog file!');
        }

        const embed = new Discord.RichEmbed()
            .setTitle('Recent changelogs')
            .setColor('#fb55fb')
            .setDescription('```\n' + contentFile + '\n```');

        message.channel.send(embed);
    }
}