const fs = require('fs');
const Discord = require('discord.js');
const Main = require('../index.js');

/**
 * checks if the file path exists
 * 
 * @param {String} path the path
 * @returns {Boolean}   true if the file exists, otherwise false
 */
function fileExists(path) {
    return fs.existsSync(path);
}

module.exports = {
    /**
     * logs a message to file
     * 
     * @param {String} logsMessage the logs message
     */
    async logThis(logsMessage) {

        let path = './logger/';
        if (!fileExists(path)) {
            fs.mkdirSync(path);
        }

        path += Main.currentDate(7).split('/').join('-') + '.log';
        if (!fileExists(path)) {
            fs.writeFileSync(path, '');
        }

        let logsContent = fs.readFileSync(path, {econding: 'utf8'});
        const toInsert = '[' + Main.currentDate(7, true) + '] ' + logsMessage;

        logsContent += '\n' + toInsert;
        fs.writeFileSync(path, logsContent, {encoding: 'utf8'});
        
        console.log(toInsert);
    }
}