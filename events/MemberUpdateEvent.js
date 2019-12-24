const Discord = require('discord.js');
const moment = require('moment');

const Main = require('../index.js');
const MuteUtil = Main.muteUtil();
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

        const mute_db = MuteUtil.muteDB();
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

        if (!MuteUtil.has(newMember.user.id)) {
            return;
        }

        const result = MuteUtil.cacheMap.get(newMember.user.id);
        if (moment.now() >= result['end'] && !result['perm']) {
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