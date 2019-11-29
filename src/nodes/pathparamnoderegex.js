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
var pathparamnode_1 = require("./pathparamnode");
var lib_1 = require("../lib");
var nodepriorities_1 = require("./nodepriorities");
var TAG = 'PathParamNodeRegex';
var PathParamNodeRegex = /** @class */ (function (_super) {
    __extends(PathParamNodeRegex, _super);
    function PathParamNodeRegex(paramName, re, postfix, prefix) {
        if (postfix === void 0) { postfix = ''; }
        if (prefix === void 0) { prefix = ''; }
        var _this = _super.call(this, paramName, postfix, prefix) || this;
        _this.regex = re;
        return _this;
    }
    Object.defineProperty(PathParamNodeRegex.prototype, "id", {
        get: function () {
            return 'PathParamNodeRegex';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PathParamNodeRegex.prototype, "priority", {
        get: function () {
            return nodepriorities_1.getNodePriority(nodepriorities_1.PRIORITY.REGEX) + this.prefix.length + this.postfix.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PathParamNodeRegex.prototype, "name", {
        get: function () {
            return TAG + "::'" + this.paramName + "'::'" + this.regex.source + "'::'" + this.prefix + "'::'" + this.postfix + "'";
        },
        enumerable: true,
        configurable: true
    });
    PathParamNodeRegex.prototype.equals = function (other) {
        return ((other.id === this.id) &&
            (other instanceof PathParamNodeRegex) &&
            (this.prefix === other.prefix) &&
            (this.postfix === other.postfix) &&
            (this.regex.source === other.regex.source));
    };
    PathParamNodeRegex.prototype.match = function (uriSegment) {
        var res = this.regex.exec(uriSegment);
        return res || false;
    };
    /**
     * @todo implement this by extracting pathParam first and then
     * calling regex method on it and if regex does not match
     * then return undefined
     *
     * @param {string} uri
     * @param {UriParams} params
     * @returns {RouteMatchResult<T>}
     */
    /*findRoute(uri: string,
     params: UriParams = {
     pathParams:  [],
     regexParams: []
     }): RouteMatchResult<T> {
  
  
  
     const extractedParam = extractUriParam(uri,  this.prefix, this.postfix);
  
     if (!extractedParam) {
  
     return false;
     }
  
     const regexParams = this.match(extractedParam.param);
  
     if (!regexParams) {
  
     return false;
     }
  
     /!**
     *
     * if only 1 match was extracted then
     * the order of matched elements is off?
     * the array will have only one element (at 0)
     * instead of normal 0 for whole string match and 1 for first extracted match
     *
     *!/
  
     if (!extractedParam.rest) {
  
     /!**
     * If no tail left in search string
     * it means there are no more segments left in string to match
     * In this case this node is a complete match
     *!/
     if (!this.controller) {
     return false;
     }
  
     return {
     controller: this.controller,
     params:     copyPathParams(params, makeParam(this.paramName, extractedParam.param), makeRegexParam(this.paramName, regexParams))
     }
  
     }
  
     return this.findChildMatch(
     extractedParam.rest,
     copyPathParams(params, makeParam(this.paramName, extractedParam.param), makeRegexParam(this.paramName, regexParams))
     );
  
     }*/
    PathParamNodeRegex.prototype.findRoutes = function (uri, params) {
        var extractedParam, regexParams, copiedParams;
        if (params === void 0) { params = {
            pathParams: [],
            regexParams: []
        }; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    extractedParam = lib_1.extractUriParam(uri, this.prefix, this.postfix);
                    if (!extractedParam) return [3 /*break*/, 4];
                    regexParams = this.match(extractedParam.param);
                    if (!regexParams) return [3 /*break*/, 4];
                    copiedParams = lib_1.copyPathParams(params, lib_1.makeParam(this.paramName, extractedParam.param), lib_1.makeRegexParam(this.paramName, regexParams));
                    if (!!extractedParam.rest) return [3 /*break*/, 2];
                    /**
                     * If no tail left in search string
                     * it means there are no more segments left in string to match
                     * In this case this node is a complete match
                     */
                    return [5 /*yield**/, __values(this.controllersWithParams(this.controllers, copiedParams))];
                case 1:
                    /**
                     * If no tail left in search string
                     * it means there are no more segments left in string to match
                     * In this case this node is a complete match
                     */
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [5 /*yield**/, __values(this.findChildMatches(extractedParam.rest, copiedParams))];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    };
    return PathParamNodeRegex;
}(pathparamnode_1.PathParamNode));
exports.PathParamNodeRegex = PathParamNodeRegex;
