const Discord = require('discord.js');
const Main = require('../index.js');
const os = require('os');

module.exports = {
    name: 'info',
    aliases: ['information', 'know', 'news', 'bot', 'discord'],
    description: 'Shows the bot information',
    /**
     * executes the command
     * 
     * @param {Discord.Message} message  the message instance
     * @param {String[]} args            the arguments 
     */
    async execute(message, args) {
        
        const client = Main.getClient();
        const embed = new Discord.RichEmbed()
            .setTitle('Bot Information')
            .setColor('#00ffff')
            .setDescription(
                'This bot is created specifically for Totsu Server (Minecraft)'
            )
            .addField('Bot prefix', 'The bot prefix is `' + Main.getPrefix() + '`')
            .addField('Online time', Main.formatElapsed(new Date().getTime() - Main.startTime()))
            .addField('Bot author', 'Alvian#1341')
            .addField('Help command', 'The help command is `' + Main.getPrefix() + 'help`')
            .setThumbnail(client.user.displayAvatarURL);

        message.channel.send(embed);
    }
}