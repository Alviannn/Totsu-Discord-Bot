const Discord = require('discord.js');
const Main = require('../../index.js');
const sql = require('better-sqlite3');
const moment = require('moment');

module.exports = {
    name: 'mutelist',
    aliases: ['mutehist', 'mutehistory'],
    description: 'Shows the muted users list (or mute history)',
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

        const member = message.member;
        const embed = new Discord.RichEmbed();

        // checks for the permission
        if (!member.hasPermission('MUTE_MEMBERS') || message.author.id !== '217970261230747648') {
            embed.setDescription("You don't have the permission to do this fam!")
                .setColor('#ff0000')
                .setFooter('Executed by ' + message.author.username, message.author.displayAvatarURL);

            return message.channel.send(embed);
        }

        // checks for the db
        if (!mute_db) {
            embed.setDescription('It seems that the mute database is nowhere to be found!\n' 
                + 'This is actually a big problem so contact your developer regarding this!')
                .setColor('#ff0000');

            return message.channel.send(embed)
                .then(() => message.channel.send(message.author.toString()));
        }

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

        return message.channel.send(embed);
    }

}