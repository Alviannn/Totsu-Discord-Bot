const Discord = require('discord.js');
const Main = require('../index.js');
const util = require('util');

module.exports = {
    name: 'eval',
    aliases: ['ev', 'evaluate', 'console'],
    description: 'Do an eval command (highly powerful)',
    group: 'Developer',
    category: 'Developer',
    /**
     * executes the command
     * 
     * @param {Discord.Message} message  the message instance
     * @param {String[]} args            the arguments 
     */
    async execute(message, args) {

        const user = message.author;
        if (user.id !== '217970261230747648') {
            return message.channel.send("You're not allowed to execute this command since you're not whitelisted as a developer!");
        }

        if (args.length === 0) {
            return message.channel.send('Usage: ' + Main.getPrefix() + this.name + ' <code to evaluate> - ' + this.description);
        }

        const config = require('../config.json');

        const codeInput = args.join(' ');
        if (codeInput.includes(config['token-bot'])) {
            message.delete(50);
        }

        let didItPass = false;

        try {
            let resultOutput = eval(codeInput);

            if (typeof resultOutput !== 'string') {
                resultOutput = util.inspect(resultOutput, {depth: 0});
            }

            const image = 'https://cdn0.iconfinder.com/data/icons/franchise-business-1/64/evaluation-research-check-list-search-512.png';
            const embed = new Discord.RichEmbed()
                .setAuthor('Evaluation Results')
                .setThumbnail(image)
                .setColor('RANDOM')
                .addField(':inbox_tray: Code Input', '```js\n' + codeInput + '```')
                .addField(':outbox_tray: Code Output', '```js\n' + resultOutput + '```')
                .setFooter('Executed by ' + user.username, user.displayAvatarURL);
    
            message.channel.send(embed);
            didItPass = true;
        } catch (error) {
            if (!error) {
                return message.channel.send('An error has occurred!');
            }
            return message.channel.send('An error has occurred! \n```js\n' + error + '```');
        }

        if (didItPass && message.deletable) {
            message.delete(100);
        }
        
    }
}