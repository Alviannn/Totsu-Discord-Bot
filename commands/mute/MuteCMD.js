const Discord = require('discord.js');
const Main = require('../../index.js');
const sql = require('better-sqlite3');
const moment = require('moment');

const durationUtil = require('../../objects/Duration.js');

module.exports = {
    name: 'mute',
    aliases: ['shut', 'tempmute', 'tmute', 'tempmute'],
    description: 'Mutes a user',
    group: 'Mute',
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
        if (args.length < 1) {
            return channel.send(
                'Usage: ' + prefix + this.name + ' <user> <duration?> <reason>' 
                + '\nUsage: ' + prefix + this.name + ' list'
                + '\nUsage: ' + prefix + this.name + ' info <user>'
                + '\n'
                + '```\n'
                + 'any parameter format that has \'?\' means optional!'
                + '\n\n' 
                + 'Examples: \n' 
                + prefix + this.name + ' @user this will mute the user permanently\n' 
                + prefix + this.name + ' @user 2d will mute the for 2 days ' 
                + '\n\n' 
                + prefix + this.name + ' info @user```'
                );
        }

        // checks for the db
        if (!mute_db) {
            embed.setDescription('It seems that the mute database is nowhere to be found!\n' 
                + 'This is actually a big problem so contact your developer regarding this!')
                .setColor('#ff0000');

            return channel.send(embed)
                .then(() => channel.send(message.author.toString()));
        }
        
        let muteRole;
        try {
            let muteRoleId = require('../../config.json')['mute-role-id'];
            muteRole = Main.findRole(muteRoleId, message.guild);

            if (!muteRole) {
                throw Error();
            }
        } catch (error) {
            return channel.send('Cannot find a role by the id of `' + muteRoleId + '`! \nPlease ask the developer to fix this issue!');
        }

        if (args[0] === 'list')  {
            const allMuted = mute_db.prepare('SELECT * FROM mute;').all();
            if (allMuted && allMuted.length > 0) {
                const names = [];
                const times = [];
                const reasons = [];

                for (const muted of allMuted) {
                    const member = Main.findMember(muted['id'], message.guild);
                    if (!member) {
                        continue;
                    }

                    names.push(member.user.username);
                    if (muted['perm'] === 'true') {
                        times.push('permanently');
                    }
                    else {
                        const millis = moment.now();
                        if (millis >= muted['end']) {
                            times.push('expired');
                        }

                        else {
                            // this is for the 'time left' before the mute expires
                            const formatted = Main.formatElapsed(muted['end'] - moment.now(), true);
                            times.push(formatted);
                        }
                    }

                    reasons.push(muted['reason']);
                }

                embed.setColor('RANDOM').setAuthor('All muted users')
                    .addField('__Muted users__', names.join('\n'), true)
                    .addField('__Time left__', times.join('\n'), true)
                    .addField('__Reason__', reasons.join('\n'), true);
            }
            else {
                embed.setColor('RANDOM').setDescription('There are no muted user!');
            }

            return channel.send(embed);
        }
        else if (args[0] === 'info') {
            if (args.length < 2) {
                return this.execute(message, []);
            }

            // checks for mentions
            let mention = args[1].match(/<@!*[0-9]{18}>/g);
            let target;

            if (mention && mention.length > 0) {
                mention = mention[0].match(/[0-9]{18}/g)[0];
                target = Main.findMember(mention, message.guild);
            }

            // checks for the member/user existence
            if (!target) {
                target = Main.findMember(args[1], message.guild);
            }

            if (!target) {
                return channel.send('Cannot find this user/member!');
            }
            if (target.user.bot) {
                return channel.send('Cannot mute a bot!');
            }

            try {
                const selectQuery = 'SELECT * FROM mute WHERE id = ?;';
                const mutedData = mute_db.prepare(selectQuery).get(target.user.id);
    
                if (!mutedData) {
                    return channel.send('There are no mute info for ' + target.user.username);
                }
    
                embed.setColor('RANDOM')
                    .setDescription(
                        '**Name**: ' + target.user.username + 
                        '\n**Time left**: ' + (mutedData['perm'] === 'true' ? 'permanent' : Main.formatElapsed(mutedData['end'] - moment.now(), true)) +
                        '\n**Reason**: ' + mutedData['reason'] +
                        '\n**Executor**: ' + mutedData['executor']
                    );
            } catch (error) {
                if (error) {
                    return channel.send('An error has occurred! \n```js\n' + error + '```');
                }
            }

            return channel.send(embed);
        }
        else {
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
                    mute_db.prepare(insertQuery).run(target.user.id, startTime, endTime, permMute + '', reason, member.user.tag);
                }
                // if the data exists then update/overwrite the data
                else {
                    mute_db.prepare(updateQuery).run(startTime, endTime, permMute + '', reason, member.user.tag, target.user.id);
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

}