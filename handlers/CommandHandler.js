const fs = require('fs');
const ascii = require('ascii-table');
const Main = require('../index.js');

module.exports = {
    /**
     * loads the commands
     */
    async loadCommands() {
        
        if (!fs.existsSync('./commands/')) {
            fs.mkdirSync('./commands/');
        }

        const commandMap = new Map();
        const files = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
        const table = new ascii().setHeading('Command File', 'Name', 'Aliases', 'Status');

        for (const file of files) {
            const command = require('../commands/' + file);

            if (command.name && command.aliases && !command.disabled) {
                commandMap.set(command.name, command);
                table.addRow(file, command.name, command.aliases.join(', '), '✅');
            }
            else {
                table.addRow(file, command.name, command.aliases.join(', '), '❌');
            }
        }

        if (table.getRows().length === 0) {
            table.addRow('', '', '', '');
        }

        Main.insertCommandMap(commandMap);
        console.log(table.toString());
    }
}