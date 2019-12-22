const Discord = require('discord.js');
const Main = require('../index.js');
const Logger = require('../handlers/Logger.js');

module.exports = {
    name: 'alert',
    aliases: ['announce', 'broadcast', 'shout', 'announcement', 'say'],
    description: 'Sends the specified message to through the bot',
    category: 'Moderation',
    /**
     * executes the command
     * 
     * @param {Discord.Message} message  the message instance
     * @param {String[]} args            the arguments 
     */
    async execute(message, args) {
        // checks for the member's permissions
        const member = message.member;
        if (!member.hasPermission('MANAGE_MESSAGES') && !member.hasPermission('MANAGE_ROLES_OR_PERMISSIONS')) {
            return Main.sendNoPerm(message);
        }
        
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
                + '\n * -color=<hex color> (to customize color)'
                + '\n * -nomention (to remove the mention tag)'
                + '\n * -title=<new title> (to add and set a title)'
                + '\n * -hidden (to hide the command executor)'
                + '\n * -debug (to not delete the executed command)'
                + '\n\n' 
                + 'Example: ' + Main.getPrefix() + this.name +  ' hello everybody -nomention -color=ff0000 -title=NewTitle -hidden'
                + '```'
            );
        }

        // creates the discord embed
        const embed = new Discord.RichEmbed().setColor('RANDOM');
        const originalArgs = args;

        // handles color parameter filtering (to customize the color)
        const colorFilter = Main.filterStartsWith(args, '-color=');
        args = colorFilter['array'];
        const newColor = colorFilter['return'];

        // handles mention parameter filtering (to allow mentioning using '@here')
        const noMentionFilter = Main.filterStartsWith(args, '-nomention');
        args = noMentionFilter['array'];
        const hasNoMention = noMentionFilter['return'];

        // handles title parameter filtering (to customize the title)
        const titleFilter = Main.filterStartsWith(args, '-title=');
        args = titleFilter['array'];
        const newTitle = titleFilter['return'];

        // handles the hidden filtering (to remove your name and icon from the footer)
        const hiddenFilter = Main.filterStartsWith(args, '-hidden');
        args = hiddenFilter['array'];
        const hasHidden = hiddenFilter['return'];

        const debugFilter = Main.filterStartsWith(args, '-debug');
        args = debugFilter['array'];
        const hasDebug = debugFilter['return'];

        // sets the new color
        if (newColor) {
            embed.setColor(newColor);
        }
        // sets the new title
        if (newTitle) {
            embed.setTitle(newTitle);
        }
        // applies the hidden filter
        if (!hasHidden) {
            embed.setFooter('Executed by ' + message.author.username, message.author.displayAvatarURL);
        }

        // joins the messages (was seperated) and sets it to the description
        embed.setDescription(args.join(' '));
        // sends the embedded message
        message.channel.send(embed);

        // deletes the original command message
        setTimeout(() => {
            if (message.deletable && !hasDebug) {
                message.delete(10);
            }
        }, 100);

        // checks if the no filter mention is true
        // if it is then the '@here' tag won't be sent
        if (!hasNoMention) {
            setTimeout(() => message.channel.send('@here'), 100);
        }

        Logger.logThis(message.author.username + ' -> alerted args=[' + originalArgs.join(', ') + ']');
    }
}