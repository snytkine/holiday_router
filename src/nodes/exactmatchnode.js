"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
exports.__esModule = true;
var rootnode_1 = require("./rootnode");
var nodepriorities_1 = require("./nodepriorities");
var TAG = 'ExactMathNode';
/**
 * Node represents uri segment that ends with path separator
 */
var ExactMatchNode = /** @class */ (function (_super) {
    __extends(ExactMatchNode, _super);
    function ExactMatchNode(uri) {
        var _this = _super.call(this) || this;
        _this.origUriPattern = uri;
        _this.segmentLength = uri.length;
        return _this;
    }
    Object.defineProperty(ExactMatchNode.prototype, "id", {
        get: function () {
            return 'ExactMatchNode';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ExactMatchNode.prototype, "priority", {
        /**
         * ExactMatch node should always have highest priority
         * @returns {number}
         */
        get: function () {
            return nodepriorities_1.getNodePriority(nodepriorities_1.PRIORITY.EXACTMATCH);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ExactMatchNode.prototype, "name", {
        get: function () {
            return TAG + "::" + this.origUriPattern;
        },
        enumerable: true,
        configurable: true
    });
    ExactMatchNode.prototype.equals = function (other) {
        return (other.id === this.id && other instanceof ExactMatchNode && other.origUriPattern === this.origUriPattern);
    };
    ExactMatchNode.prototype.findRoutes = function (uri, params) {
        var rest;
        if (params === void 0) { params = { pathParams: [] }; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!uri.startsWith(this.origUriPattern)) return [3 /*break*/, 4];
                    rest = uri.substring(this.segmentLength);
                    if (!!rest) return [3 /*break*/, 2];
                    return [5 /*yield**/, __values(this.controllersWithParams(this.controllers, params))];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2: 
                /**
                 * Have rest of uri
                 * Loop over children to get result
                 */
                return [5 /*yield**/, __values(this.findChildMatches(rest, params))];
                case 3:
                    /**
                     * Have rest of uri
                     * Loop over children to get result
                     */
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    };
    return ExactMatchNode;
}(rootnode_1.RootNode));
exports.ExactMatchNode = ExactMatchNode;
