const sql = require('better-sqlite3');

/**
 * @type {Map<String, exports.muteData>}
 */
exports.cacheMap = new Map();
exports.muteData = {
    id: '',
    start: 0,
    end: 0,
    perm: '',
    reason: '',
    executor: ''
}

exports.Mute = class {

    /**
     * constructs the mute data
     * 
     * @param {String} id       the user id
     * @param {Number} start    the start timestamp
     * @param {Number} end      the end timestamp
     * @param {Boolean} perm    true means the mute is permanent
     * @param {String} reason   the reason
     * @param {String} executor the executor tag
     */
    constructor(id, start, end, perm, reason, executor) {
        this.id = id;
        this.start = start;
        this.end = end;
        this.perm = (perm === 'true');
        this.reason = reason;
        this.executor = executor;
    }

    /**
     * @returns {exports.muteData} the sql readable mute data
     */
    toData() {
        const data = {
            id: this.id,
            start: this.start,
            end: this.end,
            perm: this.perm + '',
            reason: this.reason,
            executor: this.executor
        }

        return data;
    }
}

/**
 * constructs the mute data
 * 
 * @param {String} id       the user id
 * @param {Number} start    the start timestamp
 * @param {Number} end      the end timestamp
 * @param {Boolean} perm    true means the mute is permanent
 * @param {String} reason   the reason
 * @param {String} executor the executor tag
 * 
 * @returns {exports.Mute}  the mute instance
 */
exports.createMute = (id, start, end, perm, reason, executor) => {
    return new this.Mute(id, start, end, perm, reason, executor);
}

/**
 * @returns the mute database
 */
exports.muteDB = () => {
    const mute_db = sql('./databases/mute.db', {fileMustExist: true});

    // if the mute database doesn't exists then throw an error
    if (!mute_db) {
        throw Error('Cannot continue mute task since the mute database is missing!');
    }

    return mute_db;
}

/**
 * checks if the user id is on the database
 * 
 * @param {String} id      the user id
 * @param {Boolean} useSql true if you want to use the sql way (optional)
 * @returns {Boolean}      true if the user id exists in the database
 */
exports.has = (id, useSql) => {
    if (useSql) {
        const mute_db = this.muteDB();

        const exists = mute_db.prepare('SELECT * FROM mute WHERE id = ?').get(id);
        return !!exists;
    }

    return this.cacheMap.has(id);
}

/**
 * inserts or updates the mute data
 * 
 * @param {String} id       the user id
 * @param {Number} start    the start timestamp
 * @param {Number} end      the end timestamp
 * @param {Boolean} perm    true means the mute is permanent
 * @param {String} reason   the reason
 * @param {String} executor the executor tag
 */
exports.set = async (id, start, end, perm, reason, executor) => {
    if (
        typeof id !== 'string' || typeof start !== 'number'
        || typeof end !== 'number' || typeof perm !== 'boolean'
        || typeof reason !== 'string' || typeof executor !== 'string'
    ) {
        throw Error('Missing parameters!');
    }

    perm = perm + '';
    const mute_db = this.muteDB();

    let result;
    if (this.has(id)) {
        result = mute_db.prepare('UPDATE mute SET start = ?, end = ?, perm = ?, reason = ?, executor = ? WHERE id = ?;')
                    .run(start, end, perm, reason, executor, id);
    }
    else {
        result = mute_db.prepare('INSERT INTO mute (id, start, end, perm, reason, executor) VALUES (?, ?, ?, ?, ?, ?);')
                    .run(id, start, end, perm, reason, executor);
    }

    this.cacheMap.set(id, this.createMute(id, start, end, perm, reason, executor));

    return result;
}

/**
 * deletes a mute data
 * 
 * @param {String} id the user id
 */
exports.delete = async (id) => {
    if (typeof id !== 'string') {
        throw Error('Missing parameters!');
    }
    
    const mute_db = this.muteDB();
    let result;

    if (this.has(id)) {
        this.cacheMap.delete(id);

        result = mute_db.prepare('DELETE FROM mute WHERE id = ?;').run(id);
    }

    return result;
}

/**
 * initializes the mute cache
 */
exports.initCache = async () => {
    const mute_db = this.muteDB();
    const results = mute_db.prepare('SELECT * FROM mute;').all();

    if (results.length < 1) {
        return;
    }

    for (const res of results) {
        if (!res) {
            continue;
        }
        
        const mute = this.createMute(res['id'], res['start'], res['end'], res['perm'], res['reason'], res['executor']);
        if (!mute) {
            continue;
        }

        this.cacheMap.set(mute['id'], mute);
    }
}