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
const projectName = "totsudb";

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

let config = {};
let commandMap = new Map();

// checks if the config file exists
if (!fs.existsSync('./config.json')) {
    throw new Error("Cannot find config file!");
}

try {
    const content = fs.readFileSync('./config.json', {encoding: 'utf8'});

    // checks if the content is empty
    if (!content) {
        throw new Error("Failed to read config file!");
    }

    config = JSON.parse(content);

    // checks if the config is empty
    if (!config) {
        throw new Error("Config file may be corrupted!");
    }
} catch (error) {
    throw error;
}

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
        return config['default-prefix'];
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
    }
};

// ------------------------------------------ //

const CommandHandler = require('./handlers/CommandHandler.js');
CommandHandler.loadCommands();

console.log('');

const ListenerHandler = require('./handlers/ListenerHandler.js');
ListenerHandler.loadListeners();

// starts the bot completely
client.login(config['token-bot']);