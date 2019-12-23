const fs = require('fs');
const table = require('table');
const Main = require('../index.js');

module.exports = {
    /**
     * loads the commands
     */
    async loadCommands() {
        
        if (!fs.existsSync('./commands/')) {
            fs.mkdirSync('./commands/');
        }

        const tableArr = [];
        const commandMap = new Map();
        const files = fs.readdirSync('./commands/');

        // table initialization
        tableArr.push(['Command File', 'Name', 'Aliases', 'Status']);

        for (const file of files) {
            // check if the file is a directory
            if (fs.lstatSync('./commands/' + file).isDirectory()) {
                const dir = './commands/' + file;

                const subFiles = fs.readdirSync(dir);
                // iterates through the sub files
                for (const subFile of subFiles) {
                    if (!subFile.endsWith('.js')) {
                        continue;
                    }

                    const command = require('.' + dir + '/' + subFile);
                    if (command.name && command.aliases && !command.disabled) {
                        commandMap.set(command.name, command);
                        tableArr.push([file + '/' + subFile, command.name, command.aliases.join(', '), 'V']);
                    }
                    else {
                        tableArr.push([file + '/' + subFile, command.name, command.aliases.join(', '), 'X']);
                    }
                }
            } 
            if (!file.endsWith('.js')) {
                continue;
            }
            const command = require('../commands/' + file);

            if (command.name && command.aliases && !command.disabled) {
                if (!command.group) {
                    command.group = 'General';
                }

                commandMap.set(command.name, command);
                tableArr.push([file, command.name, command.aliases.join(', '), 'V']);
            }
            else {
                tableArr.push([file, command.name, command.aliases.join(', '), 'X']);
            }
        }

        if (tableArr.length === 1) {
            tableArr.push(['', '', '', '']);
        }

        const storeTable = table.table(tableArr, {border: table.getBorderCharacters('norc')});

        Main.insertCommandMap(commandMap);
        console.log(storeTable);
    }
}