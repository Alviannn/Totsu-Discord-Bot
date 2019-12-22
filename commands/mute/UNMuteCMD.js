const Discord = require('discord.js');
const Main = require('../../index.js');
const sql = require('better-sqlite3');
const moment = require('moment');

const durationUtil = require('../../objects/Duration.js');

module.exports = {
    name: 'unmute',
    aliases: [],
    description: 'unmutes a user',
    category: 'Moderation',
    /**
     * executes the command
     * 
     * @param {Discord.Message} message  the message instance
     * @param {String[]} args            the arguments 
     */
    async execute(message, args) {
        let mute_db;

        try {
            mute_db = sql('./databases/mute.db', {fileMustExist: true});
        } catch (error) {
        }

        const prefix = Main.getPrefix();
        const channel = message.channel;
        const member = message.member;
        const embed = new Discord.RichEmbed();

        // checks for the permission
        if (!member.hasPermission('MUTE_MEMBERS') || message.author.id !== '217970261230747648') {
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
        if (!mute_db) {
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

        let muteRoleId = require('../../config.json')['mute-role-id'];
        if (!muteRoleId) {
            return channel.send('Cannot find any role for mute identification! \nPlease ask the developer to fix this issue!');
        }

        const muteRole = Main.findRole(muteRoleId, message.guild);
        if (!muteRole) {
            return channel.send('Failed to find a role by the id of `' + muteRoleId + '`! \nPlease ask the developer to fix this issue!');
        }

        let reason = Main.copyArrayRange(args, 1).join(' ').trim();
        if (reason.length > 255) {
            embed.setDescription('The max characters allowed for the mute \'reason\' is only 255 characters!')
                .setColor('#ff0000');

            return channel.send(embed);
        }

        const selectQuery = 'SELECT * FROM mute WHERE id = ?;';
        const deleteQuery = 'DELETE FROM mute WHERE id = ?;';

        try {
            // checks if the user exists in the database
            const exists = mute_db.prepare(selectQuery).get(target.user.id);
            if (!exists) {
                embed.setColor('#ff0000')
                    .setDescription(target.user.username + ' is not muted!');

                return channel.send(embed);
            }

            // deletes the user from the database
            mute_db.prepare(deleteQuery).run(target.user.id);
        } catch (err) {
            if (err) {
                return channel.send('An error has occurred! \n```js\n' + err + '```');
            }
        }

        const roles = target.roles;
        if (roles.has(muteRole.id)) {
            roles.delete(muteRole.id);

            target.setRoles(roles);
        }

        embed.setColor('RANDOM')
            .setDescription(target.user.username + ' has been unmuted! \nReason: ' + reason);

        channel.send(embed);
    }

}