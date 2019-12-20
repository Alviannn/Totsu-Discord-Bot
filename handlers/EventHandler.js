const Main = require('../index.js');
// const ascii = require('ascii-table');
const table = require('table');
const fs = require('fs');

/**
 * handles loading the listeners
 */
function handleLoadEvents() {
    // checks if the 'listeners' folder exists
    if (!fs.existsSync('./events/')) {
        fs.mkdirSync('./events/');
    }

    const client = Main.getClient();
    const files = fs.readdirSync('./events/').filter(file => file.endsWith('.js'));

    const tableArr = [];
    tableArr.push(['Listener File', 'Event-ID', 'Status']);
    // const table = new ascii().setHeading('Listener File', 'Event-ID', 'Status');

    for (const file of files) {       
        const listener = require('../events/' + file);
        
        // checks if the event id isn't empty
        if (listener.eventId && !listener.disabled) {
            // handles the listener calling
            client.on(listener.eventId, function (...args) {
                listener.call(...args);
            });
            tableArr.push([file, listener.eventId, 'V']);
            // table.addRow(file, listener.eventId, '✅');
        }
        else {
            tableArr.push([file, listener.eventId, 'X']);
            // table.addRow(file, listener.eventId, '❌');
        }
    }

    if (tableArr.length === 1) {
        tableArr.push(['', '', '', '']);
    }

    const storeTable = table.table(tableArr, {border: table.getBorderCharacters('norc')});

    // if (table.getRows().length === 0) {
    //     table.addRow('', '', '', '');
    // }

    // shows the table (logs)
    console.log(storeTable);
}

module.exports = {
    async loadEvents() {
        handleLoadEvents();
    }
}