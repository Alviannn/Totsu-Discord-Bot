const Discord = require('discord.js');
const Main = require('../index.js');
const request = require('request');

module.exports = {
    name: 'mcstats',
    aliases: ['serverstat', 'serverstats', 'stats', 'stat', 'mcserver', 'checkmc'],
    description: 'Sends the specified message to through the bot',
    /**
     * executes the command
     * 
     * @param {Discord.Message} message  the message instance
     * @param {String[]} args            the arguments 
     */
    async execute(message, args) {
        const ipAddress = 'totsu.mchost.id'
        const url = 'https://mcapi.us/server/status?ip=' + ipAddress;

        request(url, function (error, response, body) {
            if (error) {
                return message.channel.send("An error has occurred! \n\n" + error);
            }

            let content;
            try {
                content = JSON.parse(body);
            } catch (eError) {
                return message.channel.send("Failed to parse server data!");
            }

            if (!content) {
                return message.channel.send("Failed to parse server data!");
            }
            if (content['status'] === 'error' && content['error']) {
                return message.channel.send("An error has occurred! \n\n" + content['error']);
            }

            const status = content['online'] ? 'Online :green_circle:' : 'Offline :red_circle:';
            const motd = content['motd'];
            const players = content['players']['now'] + '/' + content['players']['max'];
            const server = content['server']['name'];
            const favicon = content['favicon'];

            const embed = new Discord.RichEmbed()
                .setTitle('Totsu MC Server Status')
                .setColor('RANDOM')
                .setThumbnail(Main.getClient().user.displayAvatarURL)
                .addField('Status', status)
                .addField('Players', players);

            if (motd) {
                embed.addField('MOTD', motd);
            }
            if (server) {
                embed.addField('Misc', server);
            }

            message.channel.send(embed);
        });
    }
}