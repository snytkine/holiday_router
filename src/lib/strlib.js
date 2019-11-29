"use strict";
exports.__esModule = true;
var constants_1 = require("../interfaces/constants");
exports.escapeRegExp = function (text) {
    // -[\]()*+?.,
    return text.replace(/[\\^$|#\s]/g, '\\$&');
};
/**
 * Read string until STRING_SEPARATOR or PATH_SEPARATOR char or until end of string.
 *
 * @param {string} s
 *
 * @returns {head, tail} head is first part of string including separator,
 * tail is rest of string
 */
exports.splitBySeparator = function (s, separators) {
    var i, ch;
    var ret = {
        head: '',
        tail: ''
    };
    for (i = 0; ch = s[i++]; ch !== undefined) {
        ret.head += ch;
        if (separators.includes(ch)) {
            break;
        }
    }
    ret.tail = s.substring(i);
    return ret;
};
exports.extractUriParam = function (uri, prefix, postfix) {
    if (prefix === void 0) { prefix = ''; }
    if (postfix === void 0) { postfix = ''; }
    var param = '';
    var prefixLen = (prefix && prefix.length) || 0;
    var postfixLen = (postfix && postfix.length) || 0;
    var acc = '';
    var ch = '';
    var i = 0;
    var j = 0;
    /**
     * First read until match of prefix
     */
    while (ch !== undefined && i < prefixLen) {
        if (i < prefixLen && prefix[i] !== uri[i]) {
            /**
             * Prefix does not match
             *
             */
            return null;
        }
        i += 1;
    }
    /**
     * If string ended before the prefixLen return false
     */
    if (i < prefixLen) {
        return null;
    }
    while (ch = uri[i]) {
        if (ch === postfix[j]) {
            acc += ch;
            j += 1;
        }
        else {
            param += acc;
            acc = '';
            j = 0;
            param += ch;
        }
        i += 1;
        if (ch === constants_1.ROUTE_PATH_SEPARATOR) {
            break;
        }
    }
    if (j !== postfixLen) {
        return null;
    }
    return {
        param: param,
        rest: uri.substr(i)
    };
};
