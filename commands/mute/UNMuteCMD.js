const Discord = require('discord.js');
const Main = require('../../index.js');
const moment = require('moment');
const MuteUtil = Main.muteUtil();

module.exports = {
    name: 'unmute',
    aliases: [],
    description: 'unmutes a user',
    group: 'Mute',
    category: 'Moderation',
    /**
     * executes the command
     * 
     * @param {Discord.Message} message  the message instance
     * @param {String[]} args            the arguments 
     */
    async execute(message, args) {
        const prefix = Main.getPrefix();
        const channel = message.channel;
        const member = message.member;
        const embed = new Discord.RichEmbed();

        // checks for the permission
        if (!member.hasPermission('MUTE_MEMBERS')) {
            embed.setDescription("You don't have the permission to do this fam!")
                .setColor('#ff0000')
                .setFooter('Executed by ' + message.author.username, message.author.displayAvatarURL);

            return channel.send(embed);
        }

        // checks for the arguments
        if (args.length < 2) {
            return channel.send('Usage: ' + prefix + this.name + ' <user> <reason> ' 
                + '\nEx: ' + prefix + this.name + ' @name I think you\'re good enough to be unmuted now');
        }

        // checks for the db
        let mute_db;
        
        try {
            mute_db = MuteUtil.muteDB();
            if (!mute_db) {
                throw Error();
            }
        } catch (error) {
            embed.setDescription('It seems that the mute database is nowhere to be found!\n' 
                + 'This is actually a big problem so contact your developer regarding this!')
                .setColor('#ff0000');

            return channel.send(embed)
                .then(() => channel.send(message.author.toString()));
        }

        // checks for mentions
        let mention = args[0].match(/<@!*[0-9]{18}>/g);
        let target;

        if (mention && mention.length > 0) {
            mention = mention[0].match(/[0-9]{18}/g)[0];
            target = Main.findMember(mention, message.guild);
        }

        // checks for the member/user existence
        if (!target) {
            target = Main.findMember(args[0], message.guild);
        }
        if (!target) {
            return channel.send('Cannot find this user/member!');
        }
        if (target.user.bot) {
            return channel.send('Cannot unmute a bot!');
        }

        let muteRole;
        try {
            const muteRoleId = require('../../config.json')['mute-role-id'];
            muteRole = Main.findRole(muteRoleId, message.guild);

            if (!muteRole) {
                throw Error();
            }
        } catch (error) {
            return channel.send('Cannot find any role for mute identification! \nPlease ask the developer to fix this issue!');
        }

        let reason = Main.copyArrayRange(args, 1).join(' ').trim();
        if (reason.length > 255) {
            embed.setDescription('The max characters allowed for the mute \'reason\' is only 255 characters!')
                .setColor('#ff0000');

            return channel.send(embed);
        }

        if (!MuteUtil.has(target.user.id)) {
            embed.setColor('#ff0000')
                .setDescription(target.user.username + ' is not muted!');

            return channel.send(embed);
        }

        MuteUtil.delete(target.user.id);
        target.removeRole(muteRole);

        embed.setColor('RANDOM')
            .setDescription(target.user.username + ' has been unmuted! \n**Reason**: ' + reason);

        channel.send(embed);

        const logsEmbed = new Discord.RichEmbed()
            .setAuthor('Un-Mute')
            .setColor('#ffff00')
            .setDescription(
                '**Un-Muted user**: ' + target.user.tag
                + '\n**Un-Muted by**: ' + member.user.tag
                + '\n'
                + '\n**Reason**: ' + reason
                + '\n'
                + '\n**Time**: ' + moment(moment.now() + moment.duration(7, 'h').as('ms')).format('YYYY/MM/DD - HH:mm:ss') + ' (UTC+7)'
                + '\n**Channel**: ' + channel.name
            );

        Main.logMuteHistory(logsEmbed);
    }

}