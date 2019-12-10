const Discord = require('discord.js');
const Main = require('../index.js');

module.exports = {
    name: 'alert',
    aliases: ['announce', 'broadcast', 'shout', 'announcement', 'say'],
    description: 'Sends the specified message to through the bot',
    /**
     * executes the command
     * 
     * @param {Discord.Message} message  the message instance
     * @param {String[]} args            the arguments 
     */
    async execute(message, args) {
        if (args.length === 0) {
            // sends the usage message (very complete I see)
            return message.channel.send(
                'Usage: ' + Main.getPrefix() + this.name + ' <message> - ' + this.description 
                + '\n\n'
                + '```\n' 
                + '\n\n'
                + 'You can use some unique parameters to add more things to the embeded message.' 
                + '\n\n' 
                + 'The parameters are:'
                + '\n * -color=<hex color>'
                + '\n * -mention'
                + '\n * -title=<new title>'
                + '\n * -notitle'
                + '\n * -hidden'
                + '\n\n' 
                + 'Example: ' + Main.getPrefix() + this.name +  ' hello everybody -mention -color=ff0000 -title=NewTitle -hidden'
                + '```'
            );
        }

        // checks for the member's permissions
        const member = message.member;
        if (!member.hasPermission('MANAGE_MESSAGES') && !member.hasPermission('MANAGE_ROLES_OR_PERMISSIONS')) {
            return message.reply("You don't have the permission to do this!")
                .then(function (msg) {
                    if (msg.deletable) {
                        msg.delete(3000);
                    }
                });
        }

        // creates the discord embed
        const embed = new Discord.RichEmbed().setColor('RANDOM');

        // handles color parameter filtering (to customize the color)
        const colorFilter = Main.filterStartsWith(args, '-color=');
        args = colorFilter['array'];
        const newColor = colorFilter['return'];

        // handles mention parameter filtering (to allow mentioning using '@here')
        const mentionFilter = Main.filterStartsWith(args, '-mention');
        args = mentionFilter['array'];
        const hasMention = mentionFilter['return'];

        // handles title parameter filtering (to customize the title)
        const titleFilter = Main.filterStartsWith(args, '-title=');
        args = titleFilter['array'];
        const newTitle = titleFilter['return'];

        // handles the hidden filtering (to remove your name and icon from the footer)
        const hiddenFilter = Main.filterStartsWith(args, '-hidden');
        args = hiddenFilter['array'];
        const hasHidden = hiddenFilter['return'];

        // handles the no title filtering (to removes the title)
        const noTitleFilter = Main.filterStartsWith(args, '-notitle');
        args = noTitleFilter['array'];
        const hasNoTitle = noTitleFilter['return'];

        // TODO: Coming soon
        // ------------------
        // const noEmbedFilter = Main.filterStartsWith(args, '-noembed');
        // args = noEmbedFilter['array'];
        // const hasNoEmbed = noEmbedFilter['return'];

        // sets the new color
        if (newColor) {
            embed.setColor(newColor);
        }
        // sets the new title
        if (!hasNoTitle) {
            if (newTitle) {
                embed.setTitle(newTitle);
            }
            else {
                embed.setTitle('Alert');
            }
        }
        // applies the hidden filter
        if (!hasHidden) {
            embed.setFooter('Executed by ' + member.user.username, member.user.displayAvatarURL);
        }

        embed.setDescription(args.join(' '));

        message.channel.send(embed);
        // deletes the original command message
        if (message.deletable) {
            message.delete(50);
        }

        // if mention parameter is true, then it'll send '@here' tag
        if (hasMention) {
            setTimeout(() => message.channel.send('@here'), 100);
        }
    }
}