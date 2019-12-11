const Discord = require('discord.js');
const Logger = require('../handlers/Logger.js');

module.exports = {
    eventId: 'guildMemberRemove',
    async call(member) {
        if (!(member instanceof Discord.GuildMember)) {
            return;
        }

        const embed = new Discord.RichEmbed()
            .setAuthor(member.user.username + ' has left the server!', member.user.displayAvatarURL);

        const config = require('../config.json');

        if (!config['join-left-channel']) {
            return Logger.logThis('Failed to find join-left log channel! (#1)');
        }

        const channelId = config['join-left-channel'];

        const channels = member.guild.channels;
        const logChannel = channels.filter(channel => channel.id === channelId).first();

        if (!logChannel) {
            return Logger.logThis('Failed to find join-left log channel! (#1)');
        }

        if (!(logChannel instanceof Discord.TextChannel) && !(logChannel instanceof Discord.GroupDMChannel)) {
            return Logger.logThis('The logging channel isn\'t a text channel!');
        }

        logChannel.send(embed);
    }
}