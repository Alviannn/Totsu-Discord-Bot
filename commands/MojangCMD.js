const Discord = require('discord.js');
const request = require('request');

function convertUrl(url) {
    const keyId = {
        'minecraft.net': 'Minecraft',
        'session.minecraft.net': 'Session',
        'account.mojang.com': 'Account',
        'authserver.mojang.com': 'Authentication Server',
        'sessionserver.mojang.com': 'Session Server',
        'api.mojang.com': 'Mojang API',
        'textures.minecraft.net': 'Minecraft Textures',
        'mojang.com': 'Mojang'
    };

    return keyId[url];
}

function convertStatus(status) {
    const valueId = {
        green: 'No issues :green_circle:',
        yellow: 'There are some issues :yellow_circle:',
        red: 'Service is currently unavailable :red_circle:'
    }

    return valueId[status];
}

module.exports = {
    name: 'mojang',
    aliases: ['mojangstats'],
    description: 'Checks for the mojang server status',
    category: 'Information',
    /**
     * executes the command
     * 
     * @param {Discord.Message} message  the message instance
     * @param {String[]} args            the arguments 
     */
    async execute(message, args) {
        
        request.get('https://status.mojang.com/check', function (error, response, body) {
            if (error) {
                return message.channel.send('An error has occurred! \n\n' + error);
            }

            if (!body) {
                return message.channel.send('Failed to fetch the mojang status content!');
            }

            const content = JSON.parse(body);
            if (!content) {
                return message.channel.send('Failed to parse the mojang status content!');
            }
            
            const member = message.member;
            const embed = new Discord.RichEmbed()
                .setTitle('Mojang Status')
                .setColor('RANDOM')
                .setFooter('Executed by ' + member.user.username, member.user.displayAvatarURL)
                .setThumbnail('https://vgboxart.com/resources/logo/3993_mojang-prev.png');

            for (const value of content) {
                const keys = Object.keys(value);

                for (const key of keys) {
                    embed.addField('**' + convertUrl(key) + '**', convertStatus(value[key]));
                }
            }

            message.channel.send(embed);
        });

    }
}