"use strict";
exports.__esModule = true;
var interfaces_1 = require("../interfaces");
var nodes_1 = require("../nodes");
exports.makeCatchAllNode = function (uriSegment) {
    /**
     * Supports named catchall parameter
     * if segment looks like this: /*someParam
     * in which case param name will be someParam
     *
     * otherwise the pattern is ** and  the paramName will be **
     * @type {RegExp}
     */
    var re = /^{\*([a-zA-Z0-9-_]+)}$/;
    if (uriSegment === interfaces_1.CATCH_ALL_PARAM_NAME) {
        return new nodes_1.CatchAllNode();
    }
    var res = re.exec(uriSegment);
    if (res && Array.isArray(res) && res[1]) {
        return new nodes_1.CatchAllNode(res[1]);
    }
    return null;
};
exports.makeExactMatchNode = function (uriSegment) {
    if (uriSegment !== interfaces_1.CATCH_ALL_PARAM_NAME) {
        return new nodes_1.ExactMatchNode(uriSegment);
    }
    return null;
};
exports.makePathParamNode = function (uriSegment) {
    /**
     * Prefix = anything except { and } and /
     * followed by {
     * followed by optional spaces
     * followed by param name (alphanumeric with - and _)
     * followed by optional spaces
     * followed by }
     * followed by optional postfix which will often be just path separator or some other string.
     * @type {RegExp}
     */
    var re = /^([^{}\/]*){(?:\s*)([a-zA-Z0-9-_]+)(?:\s*)}([^{}]*)$/;
    var res = re.exec(uriSegment);
    if (!res) {
        return null;
    }
    var _ = res[0], prefix = res[1], paramName = res[2], postfix = res[3];
    return new nodes_1.PathParamNode(paramName, postfix, prefix);
};
/**
 * @throws SyntaxError if supplied regex pattern is invalid
 * @param {string} uriSegment
 * @returns {any}
 */
exports.makePathParamNodeRegex = function (uriSegment) {
    /**
     * prefix - anything except { and } and /
     * followed by {
     * optionally followed by spaces
     * followed by param name (alphanumeric or dash or underscore)
     * optionally followed by spaces
     * followed by :
     * optionally followed by spaces
     * followed by regex pattern  (anything but must be valid regex pattern or exception is thrown)
     * followed by postfix = anything except {}
     *
     * @type {RegExp}
     */
    var re = /^([^{}\/]*){(?:\s*)([a-zA-Z0-9-_]+)(?:\s*):(.*)}([^{}]*)$/;
    var res = re.exec(uriSegment);
    if (!res) {
        return null;
    }
    var _ = res[0], prefix = res[1], paramName = res[2], restr = res[3], postfix = res[4];
    var pattern = restr.trim();
    /**
     * Implicitly add the '^' to start of regex if it's not
     * already the start of regex and $ to end of regex if it's not
     * already ends with $ but if regex ends with escaped \$ then
     * it is a literal dollar sign, must still add $
     */
    if (!pattern.startsWith('^')) {
        pattern = '^' + pattern;
    }
    if (!pattern.endsWith('$') || pattern.endsWith('\\$')) {
        pattern = pattern + '$';
    }
    var nodeRegex = new RegExp(pattern);
    return new nodes_1.PathParamNodeRegex(paramName, nodeRegex, postfix, prefix);
};
/**
 * Array of factory functions that can create router node
 * Order is important because makeExactMatchNode will
 * create a new for PathParam node and
 * @type {<T>(uriSegment: string) => (Node<T> | false)[]}
 */
var factories = [
    exports.makeCatchAllNode,
    exports.makePathParamNodeRegex,
    exports.makePathParamNode,
    exports.makeExactMatchNode,
];
/**
 * Created new node(s) and append as child to parentNode
 *
 * @param {Node<T>} node
 * @param {string} uri
 * @param {T} controller
 */
exports.makeNode = function (uriSegment) {
    var ret;
    var i = 0;
    do {
        ret = factories[i](uriSegment);
    } while (!ret && i++ < factories.length);
    if (!ret) {
        throw new Error("Failed to create node for uriSegment=" + uriSegment);
    }
    return ret;
};
