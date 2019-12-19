const Discord = require('discord.js');
const Main = require('../index.js');
const fs = require('fs');

/**
 * checks if the url is an image (png, jpg, jpeg), gif, or a video (mp4, mkv)
 * 
 * @param {String} url the url
 * @returns {Boolean}  true if the url is an image, gif, or a video
 */
function isFileAcceptable(url) {
    const acceptedTypes = ['png', 'jpg', 'jpeg', 'gif', 'mp4', 'mkv'];

    for (const type of acceptedTypes) {
        if (url.toLowerCase().endsWith('.' + type)) {
            return true;
        }
    }

    return false;
}

module.exports = {
    name: 'report',
    aliases: ['lapor', 'complain'],
    description: 'Do a report',
    category: 'Moderation',
    /**
     * executes the command
     * 
     * @param {Discord.Message} message  the message instance
     * @param {String[]} args            the arguments 
     */
    async execute(message, args) {
       
        if (args.length === 0) {
            return message.channel.send('Usage: ' + Main.getPrefix() + this.name + ' <report message> - ' + this.description);
        }

        const attachments = message.attachments;
        const file = attachments.first();

        if (attachments.size === 0) {
            return message.channel.send('You must provide (an) evidence(s) in form of image (png, jpg, jpeg), gif, or a video (mp4, mkv)!');
        }

        // checks if the file is acceptable (png, jpg, jpeg, gif, mkv, and mp4 only)
        if (!file || !isFileAcceptable(file.url)) {
            return message.channel.send('You must provide (an) evidence(s) in form of image (png, jpg, jpeg), gif, or a video (mp4, mkv)!');
        }

        // gets the report channel id
        const channelId = require('../config.json')['report-channel'];

        if (!channelId) {
            return message.channel.send('Cannot find a report channel to post the report to!');
        }

        const channel = Main.findChannel(channelId, message.guild);
        if (!channel) {
            return message.channel.send('Cannot find a report channel to post the report to!');
        }

        if (!Main.isTextableChannel(channel)) {
            return message.channel.send('Cannot find a report channel to post the report to!'); 
        }

        if (!fs.existsSync('./images/')) {
            fs.mkdirSync('./images/');
        }

        await Main.downloadImage(file.url, file.filename, () => {
            // reads the file
            const buffer = fs.readFileSync('./images/' + file.filename);
            // attachs it to the discord attachment
            const attachment = new Discord.Attachment(buffer, file.filename);
    
            const user = message.member.user;
            const embed = new Discord.RichEmbed()
                .setTitle('Report File')
                .addField('Reason', args.join(' '))
                .setColor('#ff0000')
                .attachFile(attachment)
                .setImage('attachment://' + file.filename)
                .setFooter('Reported by ' + user.username, user.displayAvatarURL);
    
            setTimeout(() => {
                if (message.deletable) {
                    message.delete(100);
                }
    
                fs.unlinkSync('./images/' + file.filename);
            }, 500);

            console.log('Downloaded ' + file.filename);
    
            channel.send(embed);
        });

    }
}