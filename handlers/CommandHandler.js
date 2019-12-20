const fs = require('fs');
// const ascii = require('ascii-table');
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
        const files = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));

        tableArr.push(['Command File', 'Name', 'Aliases', 'Status']);
        // const table = new ascii().setHeading('Command File', 'Name', 'Aliases', 'Status');

        for (const file of files) {
            const command = require('../commands/' + file);

            if (command.name && command.aliases && !command.disabled) {
                commandMap.set(command.name, command);
                // table.addRow(file, command.name, command.aliases.join(', '), '✅');
                tableArr.push([file, command.name, command.aliases.join(', '), 'V']);
            }
            else {
                tableArr.push([file, command.name, command.aliases.join(', '), 'X']);
                // table.addRow(file, command.name, command.aliases.join(', '), '❌');
            }
        }

        if (tableArr.length === 1) {
            tableArr.push(['', '', '', '']);
        }

        // if (table.getRows().length === 0) {
        //     table.addRow('', '', '', '');
        // }

        const storeTable = table.table(tableArr, {border: table.getBorderCharacters('norc')});

        Main.insertCommandMap(commandMap);
        console.log(storeTable);
    }
}