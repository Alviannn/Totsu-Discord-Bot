const Discord = require('discord.js');
const Main = require('../index.js');
const request = require('request');

const imageByteProperty = {
    bytes: 1,
    fileType: 'png'
}

/**
 * Converts baseg64 encoded data to image (in byte)
 * 
 * @param {String} data         the base64 encoded data (full length)
 * @returns {imageByteProperty} the byted-image property
 */
function imageByter(data) {
    // sample -> data:image/png;base64,<encoded data>

    data = new String(data);
    if (!data || !data.startsWith('data:image/') || !data.includes(';base64,')) {
        throw 'Invalid encoded data!';
    }

    let splitData = data.split(';base64,');

    let fileExtension = splitData[0];
    let encodedData = splitData[1];

    if (!fileExtension || !encodedData) {
        throw 'Invalid encoded data!';
    }

    encodedData = Buffer.from(encodedData, 'base64');
    fileExtension = fileExtension.substring('data:image/'.length);

    return {bytes: encodedData, fileType: fileExtension};
}

module.exports = {
    name: 'mcstats',
    aliases: ['serverstat', 'serverstats', 'stats', 'stat', 'mcserver', 'checkmc'],
    description: 'Sends the specified message to through the bot',
    category: 'Information',
    /**
     * executes the command
     * 
     * @param {Discord.Message} message  the message instance
     * @param {String[]} args            the arguments 
     */
    async execute(message, args) {
        const ipAddress = 'mythe.mchost.id'
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

            const onlineEmoji = '<a:online_stats:657075573520334848>';
            const offlineEmoji = '<a:offline_stats:657075572345667613>';

            const status = content['online'] ? 'Online ' + onlineEmoji : 'Offline ' + offlineEmoji; // 'Online :green_circle:' : 'Offline :red_circle:'
            const motd = content['motd'];
            const players = content['players']['now'] + '/' + content['players']['max'];
            const server = content['server']['name'];
            const favicon = content['favicon'];

            const embed = new Discord.RichEmbed()
                .setTitle('Mythe MC Server Status')
                .setColor('RANDOM')
                // .setThumbnail(Main.getClient().user.displayAvatarURL)
                .addField('IP Address', ipAddress)
                .addField('Status', status)
                .addField('Players', players);

            if (motd) {
                embed.addField('MOTD', motd);
            }
            // if (server) {
            //     embed.addField('Misc', server);
            // }

            if (favicon) {
                const property = imageByter(favicon);

                if (property) {
                    const imageData = property['bytes'];
                    const fileType = property['fileType'];

                    // attaches the icon file to discord attachment
                    const attachment = new Discord.Attachment(imageData, 'mythe-icon.' + fileType);
                    // attaches and sets the thumbnail to the icon
                    embed.attachFile(attachment).setThumbnail('attachment://mythe-icon.' + fileType);
                }
            }

            message.channel.send(embed);
        });
    }
}