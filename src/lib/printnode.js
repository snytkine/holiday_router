"use strict";
exports.__esModule = true;
var index_1 = require("./index");
exports.printNode = function (node, indent) {
    if (indent === void 0) { indent = 0; }
    return "\n    " + ' '.repeat(indent * 4) + " || " + '='.repeat(36) + "\n    " + ' '.repeat(indent * 4) + " || node=" + node.name + "\n    " + ' '.repeat(indent * 4) + " || priority=" + node.priority + "\n    " + ' '.repeat(indent * 4) + " || hasControllers=" + (node.controllers.length > 0) + "\n    " + ' '.repeat(indent * 4) + " || children (" + node.children.length + ") =" + index_1.printChildren(node.children, indent) + "\n    " + ' '.repeat(indent * 4) + " || " + '='.repeat(36);
};
