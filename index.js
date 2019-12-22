const startMillis = new Date().getTime();

// ----------------------- Glitch Stuff ----------------------- //

const express = require("express");
const app = express();

app.use(express.static("public"));

app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});

// ----------------------- Glitch Stuff ----------------------- //

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
const sql = require('better-sqlite3');
const moment = require('moment');

const Command = require('./objects/Command.js');

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
     * @param {Map<String, Command>} commands the command list
     */
    insertCommandMap(commands) {
        commandMap = commands;
    },

    /**
     * @returns {Map<String, Command>} the command list
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
     * searches for a user from a message
     * 
     * based on username, nickname, and id
     * 
     * @param {String} name                     the name or user id
     * @param {Discord.Guild} guild             the discord guild (server)
     * @returns {Discord.GuildMember | null}    the fetched user
     */
    findMember(name, guild) {
        // the members list
        const members = guild.members.values();

        // searches based on user id
        if (name.match(/[0-9]{18}/g)) {
            for (const member of members) {
                if (member.user.id !== name) {
                    continue;
                }

                return member;
            }
        }

        // searches based on username
        for (const member of members) {
            if (member.user.username === name) {
                return member;
            }
        }

        // searches based on nickname / display name
        for (const member of members) {
            // based on nickname
            if (member.nickname === name) {
                return member;
            }
            // based on display name
            else if (member.displayName === name) {
                return member;
            }
        }

        return null;
    },

    /**
     * finds a channel by id
     * 
     * @param {String} channelId              the channel id
     * @param {Discord.Guild} guild           the discord guild instance
     * @returns {Discord.Channel | undefined} the discord channel
     */
    findChannel(channelId, guild) {
        const channels = guild.channels.values();

        for (const channel of channels) {
            if (channel.id === channelId) {
                return channel;
            }
        }

        return;
    },


    /**
     * finds a role by id
     * 
     * @param {String} roleId               the role id
     * @param {Discord.Guild} guild         the discord guild instance
     * @returns {Discord.Role | undefined}  the discord role
     */
    findRole(roleId, guild) {
        const roles = guild.roles.values();

        for (const role of roles) {
            if (role.id === roleId) {
                return role;
            }
        }

        return;
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
    },

    /**
     * sets the discord presence
     * 
     * @param {Discord.PresenceData} data the presence data
     */
    setPresence(data) {
        client.user.setPresence(data);
    },

    /**
     * sets the discord presence simply
     * 
     * @param {Discord.PresenceStatus} status   the presence status
     * @param {Discord.ActivityType} type       the status type
     * @param {String} message                  the status message
     */
    setSimplePresence(status, type, message) {
        this.setPresence({
            status: status,
            game: {
                type: type,
                name: message
            }
        });
    },

    /**
     * formats the elapsed millis
     * 
     * @param {Number} millis      the millis
     * @param {Boolean} minimalist true, will do a minimalist format (from: 'days, hours' to 'd, h')
     * @param {Boolean} noTrailing true, will remove any trailing numbers
     * @returns {String}           the formatted (elapsed) time
     */
    formatElapsed(millis, minimalist, noTrailing) {
        if (typeof millis !== 'number' && typeof millis !== 'bigint') {
            throw Error('The millis parameter must be number/bigint!');
        }

        let seconds = parseInt((millis / 1000).toFixed());

        // doing calculations
        let years = 0;
        while (seconds >= 31557600) {
            years++;
            seconds -= 31557600;
        }

        let months = 0;
        while (seconds >= 2629800) {
            months++;
            seconds -= 2629800;
        }

        let weeks = 0;
        while (seconds >= 604800) {
            weeks++;
            seconds -= 604800;
        }

        let days = 0;
        while (seconds >= 86400) {
            days++;
            seconds -= 86400;
        }

        let hours = 0;
        while (seconds >= 3600) {
            hours++;
            seconds -= 3600;
        }

        let minutes = 0;
        while (seconds >= 60) {
            minutes++;
            seconds -= 60;
        }

        // starts the formatting
        const builder = [];
        if (years >= 1) {
            builder.push(years + (minimalist ? 'y' : ' year' + (years > 1 ? 's' : '')));
        }
        if (months >= 1) {
            builder.push(months + (minimalist ? 'mo' : ' month' + (months > 1 ? 's' : '')));
        }
        if (weeks >= 1) {
            builder.push(weeks + (minimalist ? 'w' : ' week' + (weeks > 1 ? 's' : '')));
        }
        if (days >= 1) {
            builder.push(days + (minimalist ? 'd' : ' day' + (days > 1 ? 's' : '')));
        }
        if (hours >= 1) {
            builder.push(hours + (minimalist ? 'h' : ' hour' + (hours > 1 ? 's' : '')));
        }
        if (minutes >= 1) {
            builder.push(minutes + (minimalist ? 'm' : ' minute' + (minutes > 1 ? 's' : '')));
        }
        if (seconds >= 1) {
            builder.push(seconds + (minimalist ? 's' : ' second' + (seconds > 1 ? 's' : '')));
        }

        if (noTrailing) {
            return builder[0];
        }

        return builder.join(' ');
    },

    /**
     * @returns {Number} the start time (in millis)
     */
    startTime() {
        return startMillis;
    },

    /**
     * finds an emoji
     * 
     * @param {Discord.Guild} guild the discord guild
     * @param {String} name         the emoji name
     * @param {Boolean} animated    true, if the emoji is animated
     * @returns {Discord.Emoji}     the emoji
     */
    findEmoji(guild, name, animated) {
        if (!(guild instanceof Discord.Guild)) {
            return;
        }

        if (!animated) {
            animated = false;
        }

        const emoji = guild.emojis.find(emoji => emoji.animated === animated && emoji.name === name);
        return emoji;
    },

    /**
     * copies an array with a specific range
     *
     * @param {Array} array  the array
     * @param {Number} start the starting index
     * @param {Number} end   the ending index (optional)
     * @returns {Array}      the copied array
     */
    copyArrayRange(array, start, end) {
        // checks if the array is actually an array
        if (!Array.isArray(array)) {
            return;
        }
    
        // initializes the copy array variable
        const copyArray = [];

        // loops the array
        // the starting point is where the 'start' index is
        // since the 'end' index is optional, the end point could be the total index
        for (let i = start; i < (end ? end : array.length); i++) {
            // adds the value to the 'copyArray' variable
            copyArray.push(array[i]);
        }
    
        // returns the copied array
        return copyArray;
    }
};

// ---------------- Handler ---------------- //

const CommandHandler = require('./handlers/CommandHandler.js');
CommandHandler.loadCommands();

const EventHandler = require('./handlers/EventHandler.js');
EventHandler.loadEvents();

/**
 * initalizes the databases
 */
function init_db() {

    if (!fs.existsSync('./databases/')) {
        fs.mkdirSync('./databases/');
    }

    const mute_db = sql('./databases/mute.db');
    mute_db.prepare("CREATE TABLE IF NOT EXISTS mute "
        + "(id TINYTEXT NOT NULL, start BIGINT NOT NULL DEFAULT '0', " 
        + "end BIGINT NOT NULL DEFAULT '0', perm BOOLEAN NOT NULL, " 
        + "reason TINYTEXT NOT NULL, executor TINYTEXT NOT NULL);")
        .run();
}

/**
 * starts the mute task
 * 
 * this task is very useful and has a big role for the mute feature
 * 
 * Why? Because if the mute ends for a specific user then it'll remove it from the mute database
 */
function startMuteTask() {
    setInterval(async () => {
        const mute_db = sql('./databases/mute.db', {fileMustExist: true});

        // if the mute database doesn't exists then throw an error
        if (!mute_db) {
            throw Error('Cannot continue mute task since the mute database is missing!');
        }

        // const mutePropery = {
        //     id: String,
        //     start: BigInt,
        //     end: BigInt,
        //     perm: Boolean
        // }

        const guild = client.guilds.first();
        let muteRoleId = config['mute-role-id'];
        if (!muteRoleId) {
            throw Error('Cannot find the mute role!');
        }

        const muteRole = module.exports.findRole(muteRoleId, guild);
        if (!muteRole) {
            throw Error('Cannot find the mute role!');
        }

        const results = mute_db.prepare('SELECT * FROM mute;').all();
        if (results.length < 1) {
            return;
        }

        // iterates through all of the properties
        for (const res of results) {
            const id = res['id'];

            const member = module.exports.findMember(id, guild);
            if (!member) {
                continue;
            }

            // if the mute result already expires then delete it from the database
            if (moment.now() >= res['end'] && res['perm'] === 'false') {
                if (!member.roles.has(muteRole.id)) {
                    continue;
                }

                const roles = member.roles;
                roles.delete(muteRole.id);

                member.setRoles(roles);

                // const embed = new Discord.RichEmbed()
                //     .setDescription('Your mute has expired!')
                //     .setColor('RANDOM');

                // member.user.send(embed);

                mute_db.prepare('DELETE FROM mute WHERE id = ?;').run(res['id']);
                continue;
            }

            if (!member.roles.has(muteRole.id)) {
                const roles = member.roles;
                roles.set(muteRole.id, muteRole);

                member.setRoles(roles);
            }
        }
    }, moment.duration(5, 'second').as('ms'));
}

// starts the bot completely
setTimeout(async () => {
    client.login(config['token-bot']);

    init_db();

    startMuteTask();
}, 100);