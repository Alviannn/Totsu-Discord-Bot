const Discord = require('discord.js');
const moment = require('moment');

const Main = require('../index.js');
const MuteUtil = Main.muteUtil();
const config = require('../config.json');

module.exports = {
    eventId: 'guildMemberAdd',
    /**
     * 
     * @param {Discord.GuildMember} member the member
     */
    async call(member) {
        const embed = new Discord.RichEmbed()
            .setAuthor(member.user.username + ' has joined the server!', member.user.displayAvatarURL)
            .setColor('#00ff00');

        if (!config['join-left-channel']) {
            throw Error('Failed to find join-left log channel! (#1)');
        }

        const channelId = config['join-left-channel'];
        const channels = member.guild.channels;
        const logChannel = channels.find(channel => channel.id === channelId);

        if (!logChannel) {
            throw Error('Failed to find join-left log channel! (#2)');
        }
        if (!Main.isTextableChannel(logChannel)) {
            throw Error('The logging channel isn\'t a text channel!');
        }

        logChannel.send(embed);

        // ----------- Mute System ----------- //

        const mute_db = MuteUtil.muteDB();
        const guild = member.guild;
        let muteRole;

        try {
            let muteRoleId = config['mute-role-id'];
            muteRole = Main.findRole(muteRoleId, guild);

            if (!muteRole || !(muteRole instanceof Discord.Role)) {
                throw Error();
            }
        } catch (error) {
            throw Error('Cannot find the mute role!');
        }

        if (MuteUtil.has(member.user.id)) {
            const result = MuteUtil.cacheMap.get(member.user.id);
            if (moment.now() >= result['end'] && !result['perm']) {
                return;
            }
            if (member.roles.has(muteRole.id)) {
                return;
            }
    
            setTimeout(() => {
                member.addRole(muteRole);
            }, 1000);
        }

    }
}