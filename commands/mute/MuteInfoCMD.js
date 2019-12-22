const Discord = require('discord.js');
const Main = require('../../index.js');
const sql = require('better-sqlite3');
const moment = require('moment');

module.exports = {
    name: 'muteinfo',
    aliases: [],
    description: 'Shows the info for a specific user',
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
            return channel.send('Usage: ' + prefix + this.name + ' <user>');
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
            return channel.send('A bot can never be muted or unmuted!');
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

            return channel.send(embed);

        } catch (error) {
            if (error) {
                return channel.send('An error has occurred! \n```js\n' + error + '```');
            }
        }
    }

}