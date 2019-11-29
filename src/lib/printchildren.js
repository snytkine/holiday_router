"use strict";
exports.__esModule = true;
var printnode_1 = require("./printnode");
exports.printChildren = function (children, indent) {
    if (indent === void 0) { indent = 1; }
    var ret = '';
    for (var i = 0; i < children.length; i++) {
        ret = ret + ("" + printnode_1.printNode(children[i], indent + 1));
    }
    return ret;
};
