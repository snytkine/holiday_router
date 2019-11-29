"use strict";
exports.__esModule = true;
/**
 * Router nodes will be sorted by priority
 * Node with higher priority (based on node type)
 * will be tried first
 * Order of node types in this enum is important
 * it should be ordered from low to high - root node is lowest priority (0)
 * and exactmatch node should be highest.
 */
var PRIORITY;
(function (PRIORITY) {
    PRIORITY[PRIORITY["ROOT"] = 0] = "ROOT";
    PRIORITY[PRIORITY["CATCHALL"] = 1] = "CATCHALL";
    PRIORITY[PRIORITY["PATHPARAM"] = 2] = "PATHPARAM";
    PRIORITY[PRIORITY["REGEX"] = 3] = "REGEX";
    PRIORITY[PRIORITY["EXACTMATCH"] = 4] = "EXACTMATCH";
})(PRIORITY = exports.PRIORITY || (exports.PRIORITY = {}));
exports.getNodePriority = function (nodeType) {
    return Math.pow(100, nodeType);
};
