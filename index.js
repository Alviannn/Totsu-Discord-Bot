// server.js
// where your node app starts

// init project
const express = require("express");
const app = express();

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});

// ------------------------------------------------- //

const fetch = require("superagent");
const projectName = "totsu-dbt";

fetch.get("https://" + projectName + ".glitch.me/").set("user-agent", "official-pinger/1.0.0").then(x => x);

setInterval(() => {
  fetch.get("https://" + projectName + ".glitch.me/").set("user-agent", "official-pinger/1.0.0").then(x => x);
}, 180000); 

setInterval(() => {
  fetch.get("https://" + projectName + ".glitch.me/").set("user-agent", "official-pinger/1.0.0").then(x => x);
}, 240000);

// ------------------------------------------------- //

const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const request = require('request');

let config = {};
let commandMap = new Map();

// checks if the config file exists
if (!fs.existsSync('./config.json')) {
    throw new Error("Cannot find config file!");
}

config = require('./config.json');

// ------------------------------------------ //

module.exports = {
    /**
     * @returns {Discord.Client} the bot client instance
     */
    getClient() {
        return client;
    },

    /**
     * @returns {String} the bot prefix
     */
    getPrefix() {
        return config['prefix'] ? config['prefix'] : config['default-prefix'];
    },

    /**
	 * checks if value is a number
	 * 
	 * @param {String} value	the possible number value
	 * @returns {Boolean} 		true if value is number, otherwise false
	 */
	isNumber(value) {
		return !isNaN(parseFloat(value)) && isFinite(value);
	},

    /**
     * inserts the command list
     * 
     * @param {Map} commands the command list
     */
    insertCommandMap(commands) {
        commandMap = commands;
    },

    /**
     * @returns {Map} the command list
     */
    getCommandMap() {
        return commandMap;
    },

    /**
     * filters the array (based on String#startsWith function)
     * 
     * @param {String[]} array 
     * @param {String} toBeFilter
     * @returns {Object} the filter property object [return, and array]
     */
    filterStartsWith(array, toBeFilter) {
        const property = {};
        let newArray = [];
    
        for (let i = 0; i < array.length; i++) {
            const str = array[i];

            if (!property['return'] && str.startsWith(toBeFilter)) {
                let value = str.substring(toBeFilter.length);
                if (!value) {
                    value = true;
                }

                property['return'] = value;

                continue;
            }
            
            newArray.push(str);
        }
    
        property['array'] = newArray;
    
        return property;
    },
    
    /**
     * parses the value to boolean
     * 
     * @param {String} str  the possible boolean value
     * @returns {Boolean}   the parsed boolean (if it's not parseable it will return false)
     */
    parseBoolean(str) {
        str = new String(str);
        if (str.toLowerCase() === 'true') {
            return true;
        }
        else {
            return false;
        }
    },

    /**
     * @returns {config} the config
     */
    getConfig() {
        return config;
    },

    /**
     * saves and sets the new config as the main config
     * 
     * @param {config | Object} newConfig the new config
     * @returns {config} the new config
     */
    saveConfig(newConfig) {
        config = newConfig;

        fs.writeFileSync('./config.json', JSON.stringify(config, null, 4));

        return config;
    },

    /**
     * sends a 'no permission' message to the specified channel
     * 
     * @param {Discord.Message} message the message instance
     * @param {Boolean} tagExecutor     true, if you want to tag the executor
     */
    sendNoPerm(message, tagExecutor) {
        const member = message.member;
        const embed = new Discord.RichEmbed()
            .setDescription('You don\'t have the permission to execute this feature/command!')
            .setColor('#ff0000')
            .setThumbnail('https://cdn1.iconfinder.com/data/icons/color-bold-style/21/08-512.png')
            .setFooter('Executed by ' + member.user.username, member.user.displayAvatarURL);

        message.channel.send(embed)
            .then(msg => msg.delete(3000));
            
        if (tagExecutor) {
            message.channel.send('@' + member.user.username)
                .then(msg => msg.delete(3000));
        }
    },

    /**
     * @param {Number} hourDiff         the hours of difference
     * @param {Boolean} provideSpecific true, if you want a more specific time (hours, minutes, and seconds)
     * @returns {String}                current UTC date in beautiful format
     */
    currentDate(hourDiff, provideSpecific) {
        const millisDiff = hourDiff * (60 * 60) * 1000;
        const millis = new Date().getTime() + millisDiff;

        const date = new Date();
        date.setTime(millis);

        let formatted = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
        if (provideSpecific) {
            formatted += ' - ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        }

        return formatted;
    },

    /**
     * fetches a user from a message
     * <p>
     * based on nickname and it's real username
     * 
     * @param {String} name                     the name
     * @param {Discord.Guild} guild             the discord guild (server)
     * @returns {Discord.GuildMember | null}    the fetched user
     */
    fetchMember(name, guild) {

        // fetches a user based on real username
        for (const member of guild.members.values()) {
            if (member.user.username === name) {
                return member.user;
            }
        }

        // fetches a user based on nickname / display name
        for (const member of guild.members.values()) {
            // based on nickname
            if (member.nickname === name) {
                return member.user;
            }
            // based on display name
            else if (member.displayName === name) {
                return member.user;
            }
        }

        return null;
    },

    /**
     * finds a channe;
     * 
     * @param {String} channelId    the channel id
     * @param {Discord.Guild} guild the discord guild instance
     * @returns {Discord.Channel}   the discord channel
     */
    findChannel(channelId, guild) {
        const channels = guild.channels.values();

        for (const channel of channels) {
            if (channel.id === channelId) {
                return channel;
            }
        }

        return null;
    },

    /**
     * checks if the channel is a text channel (textable channel)
     * 
     * @param {Discord.Channel} channel the discord channel instance
     * @returns {Boolean}               true if the channel is textable
     */
    isTextableChannel(channel) {
        const textChannel = channel instanceof Discord.TextChannel;
        const dmChannel = channel instanceof Discord.DMChannel;
        const groupDMChannel = channel instanceof Discord.GroupDMChannel;

        return textChannel || dmChannel || groupDMChannel;
    },

    /**
     * downloads an image from url
     * 
     * @param {String} url          the url
     * @param {String} name         the file name
     * @param {function} callback   the callback function
     */
    downloadImage(url, name, callback) {
        // do a header request
        request.head(url, function (err, res, body) {
            // checks if any error occurrs
            if (err) {
                return err;
            }

            // downloads the file to a specific path
            request(url)
                .pipe(fs.createWriteStream('./images/' + name))
                .on('close', callback)
        });
    }
};

// ------------------------------------------ //

const CommandHandler = require('./handlers/CommandHandler.js');
CommandHandler.loadCommands();

console.log('');

const ListenerHandler = require('./handlers/ListenerHandler.js');
ListenerHandler.loadListeners();

// starts the bot completely
setTimeout(() => {
    client.login(config['token-bot']);
}, 100);