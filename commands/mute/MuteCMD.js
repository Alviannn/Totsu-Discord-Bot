const Discord = require('discord.js');
const Main = require('../../index.js');
const sql = require('better-sqlite3');
const moment = require('moment');

const durationUtil = require('../../objects/Duration.js');

module.exports = {
    name: 'mute',
    aliases: ['shut', 'tempmute', 'tmute', 'tempmute'],
    description: 'Mutes a user',
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
            return channel.send('Usage: ' + prefix + this.name + ' <user> <duration?> <reason>' 
                + '```\n'
                + 'any parameter format that has \'?\' means optional!'
                + '\n\n' 
                + 'Examples: \n' 
                + prefix + this.name + ' @user this will mute the user permanently\n' 
                + prefix + this.name + ' @user 2d will mute the for 2 days```');
        }

        // checks for the db
        if (!mute_db) {
            embed.setDescription('It seems that the mute database is nowhere to be found!\n' 
                + 'This is actually a big problem so contact your developer regarding this!')
                .setColor('#ff0000');

            return channel.send(embed)
                .then(() => channel.send(message.author.toString()));
        }
        
        let muteRoleId = require('../../config.json')['mute-role-id'];
        if (!muteRoleId) {
            return channel.send('Cannot find any role for mute identification! \nPlease ask the developer to fix this issue!');
        }

        const muteRole = Main.findRole(muteRoleId, message.guild);
        if (!muteRole) {
            return channel.send('Failed to find a role by the id of `' + muteRoleId + '`! \nPlease ask the developer to fix this issue!');
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
            return channel.send('Cannot mute a bot!');
        }

        let reason = Main.copyArrayRange(args, 1).join(' ').trim();
        let duration;
        let permMute = true;

        // fetches the duration prop from the arguments
        try {
            duration = durationUtil.findDuration(reason);
            if (duration) {
                permMute = false;

                reason = duration['afterRemoval'].trim();
                if (reason === '') {
                    return this.execute(message, []);
                }
            }
        } catch (err) {
            // if the error exists then return the error
            if (err) {
                return channel.send('An error has occurred! \n```js\n' + err + ' #1```');
            }
        }

        if (reason.length > 255) {
            embed.setDescription('The max characters allowed for the mute \'reason\' is only 255 characters!')
                .setColor('#ff0000');

            return channel.send(embed);
        }

        const insertQuery = 'INSERT INTO mute (id, start, end, perm, reason, executor) VALUES (?, ?, ?, ?, ?, ?);';
        const updateQuery = 'UPDATE mute SET start = ?, end = ?, perm = ?, reason = ?, executor = ? WHERE id = ?;';

        let startTime = moment.now();
        let endTime = 0;

        try {
            // to check for the data existence later
            const exists = mute_db.prepare("SELECT * FROM mute WHERE id = ?;")
                    .get(target.user.id);
            
            // inserts the end time value (only if the mute is permanent)
            if (!permMute) {
                endTime = moment.now() + (moment.duration(duration.num, duration.type).as('ms'));
            }

            // if the data doesn't exists then make a new one
            if (!exists) {
                mute_db.prepare(insertQuery).run(target.user.id, startTime, endTime, permMute + '', reason, member.user.username);
            }
            // if the data exists then update/overwrite the data
            else {
                mute_db.prepare(updateQuery).run(startTime, endTime, permMute + '', reason, member.user.username, target.user.id);
            }
        } catch (err) {
            // if the error exists then return the error
            if (err) {
                return channel.send('An error has occurred! \n```js\n' + err + ' #2```');
            }
        }

        const roles = target.roles.set(muteRole.id, muteRole);
        target.setRoles(roles);

        embed.setColor('RANDOM');
        if (permMute) {
            embed.setDescription(target.user.username + ' has been muted permanently! \n**Reason**: ' + reason);
        }
        else {
            embed.setDescription(
                target.user.username + ' has been temp-muted! ' 
                    + '\n**Duration**: ' + duration['num'] + ' ' + duration['type'] + (duration['num'] > 1 ? 's' : 's')
                    + '\n**Reason**: ' + reason
            );
        }

        channel.send(embed);
    }

}