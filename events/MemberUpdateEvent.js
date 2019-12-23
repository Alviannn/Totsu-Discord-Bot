const Discord = require('discord.js');
const sql = require('better-sqlite3');
const moment = require('moment');

const Main = require('../index.js');
const config = require('../config.json');

module.exports = {
    eventId: 'guildMemberUpdate',
    /**
     * @param {Discord.GuildMember} oldMember the old member
     * @param {Discord.GuildMember} newMember the new member
     */
    async call(oldMember, newMember) {

        if (oldMember.roles === newMember.roles) {
            return;
        }

        const mute_db = sql('./databases/mute.db', {fileMustExist: true});
        if (!mute_db) {
            throw Error('Cannot find mute database!');
        }

        const guild = newMember.guild;
        let muteRole;

        try {
            let muteRoleId = config['mute-role-id'];
            muteRole = Main.findRole(muteRoleId, guild);
            if (!muteRole) {
                throw Error();
            }
        } catch (error) {
            throw Error('Cannot find the mute role!');
        }

        const selectQuery = 'SELECT * FROM mute WHERE id = ?;';
        const result = mute_db.prepare(selectQuery).get(newMember.user.id);
        if (!result || !(muteRole instanceof Discord.Role)) {
            return;
        }
        if (moment.now() >= result['end'] && result['perm'] === 'false') {
            return;
        }

        if (newMember.roles.has(muteRole.id)) {
            return;
        }

        setTimeout(() => {
            newMember.addRole(muteRole);
        }, 1000);
    }
}