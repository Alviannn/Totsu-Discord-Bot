const Discord = require('discord.js');
const Main = require('../index.js');
const os = require('os');

module.exports = {
    name: 'info',
    aliases: ['information', 'know', 'news', 'bot', 'discord'],
    description: 'Shows the bot information',
    category: 'Information',
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
            .setColor('#FF9900')

            .setDescription(
                'This bot is created specifically for Mythe Minecraft Server'
            )

            .addField('Bot prefix', 'The bot prefix is `' + Main.getPrefix() + '`')
            .addField('Online time', Main.formatElapsed(new Date().getTime() - Main.startTime()))
            .addField('Bot author', 'Alvian#1341')
            .addField('Help command', 'The help command is `' + Main.getPrefix() + 'help`')
            .addField('Source code', 'This bot is open-source, you can view it [here](https://github.com/Alviannn/Totsu-Discord-Bot/) <:github_icon_filled:675270433007861771>')
            // .addField('Specifications', os.cpus()[0].model + ' (' + os.cpus().length + ')')

            .setThumbnail(client.user.displayAvatarURL);

        message.channel.send(embed);
    }
}