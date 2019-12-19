const Discord = require('discord.js');
const Main = require('../index.js');

module.exports = {
    eventId: 'message',
    async call(message) {
        if (!(message instanceof Discord.Message)) {
            return;
        }

        const client = Main.getClient();

        // sends the prefix info when the bot is mentioned!
        if (message.isMentioned(client.user)) {
            const embed = new Discord.RichEmbed()
                .setTitle('Information')
                .setColor('RANDOM')
                .setDescription("Nani?! You're mentioning me?... \n" 
                    + "I'm pretty sure that you want to know my prefix command right? :3 \n\n"
                    + "Alright, my prefix command is `" + Main.getPrefix() + "`! \n\n" 
                    + "If you want to know my command list just type `" + Main.getPrefix() + "help" + "`!\n"
                    + "Source code: [here](https://github.com/Alviannn/Totsu-Discord-Bot/) " + Main.findEmoji(message.guild, 'github_icon_filled'));

            return message.channel.send(embed);
        }

        let content = message.content;
        const prefix = Main.getPrefix();
        const commandMap = Main.getCommandMap();

        // checks if the message starts with the prefix
        if (!content.startsWith(prefix)) {
            return;
        }
        // checks if the sender is a bot
        if (message.member.user.bot) {
            return;
        }

        content = content.substring(prefix.length);
        
        const args = content.split(' ');
        const name = args.shift().toLowerCase();

        // looping through the entire command map
        for (const command of commandMap.values()) {
            if (command.name.toLowerCase() === name) {
                return command.execute(message, args);
            }
            // looping through the command aliases
            for (const alias of command.aliases) {
                if (alias.toLowerCase() === name) {
                    return command.execute(message, args);
                }
            }
        }
        
    }
}