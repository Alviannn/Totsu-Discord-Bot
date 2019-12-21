
/**
 * this act as the duration property;
 */
exports._durationProp = {
    num: 0,
    type: 'second' || 'minute' || 'hour' || 'day' || 'week' || 'month' || 'year',
    input: '',
    rawDuration: '',
    afterRemoval: ''
}

/**
 * identifies the duration name/type for the specified string
 * 
 * @param {String} string                            the string
 * @returns {exports._durationProp.type | undefined} the duration type
 */
exports.identifyDuration = function (string) {
    const ids = {
        's': 'second',
        'm': 'minute',
        'h': 'hour',
        'd': 'day',
        'w': 'week',
        'mo': 'month',
        'y': 'year'
    }

    return ids[string];
}
/**
 * finds the duration (both type and number) from a string
 * 
 * @param {String} string               the string
 * @returns {exports._durationProp | undefined} the duration property
 */
exports.findDuration = function (string) {
    if (string.trim() === '') {
        return;
    }

    const regex = /\b[0-9]+(s|m|h|d|w|mo|y)\b/g;
    const matchArray = string.match(regex);

    if (!matchArray || matchArray.length < 0) {
        return;
    }

    const duration = string.match(regex)[0];
    const after = string.replace(matchArray[0], '');

    const numRegex = /[0-9]+/;
    const typeRegex = /(s|m|h|d|w|mo|y)/;

    const type = exports.identifyDuration(duration.match(typeRegex)[0]);
    const num = parseInt(duration.match(numRegex)[0]);

    if (!type || !num || !after) {
        throw Error('Failed to identify duration type or number!');
    }

    return {num: num, type: type, rawDuration: string.match(regex)[0], input: string, afterRemoval: after};
}

/**
 * removes the duration string from the actual string
 * 
 * @param {String} string the full string
 * @returns {String}      the string without the duration
 */
exports.removeDuration = function (string) {
    const regex = /\b[0-9]+(s|m|h|d|w|mo|y)\b/g;
    const matchArray = string.match(regex);

    if (matchArray || matchArray.length <= 0) {
        return string;
    }

    return string.replace(matchArray[0]);
}