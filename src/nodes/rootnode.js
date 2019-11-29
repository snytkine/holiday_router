"use strict";
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
var interfaces_1 = require("../interfaces");
var lib_1 = require("../lib");
var nodepriorities_1 = require("./nodepriorities");
var RootNode = /** @class */ (function () {
    function RootNode() {
        this.children = [];
        this.controllers = [];
    }
    Object.defineProperty(RootNode.prototype, "id", {
        get: function () {
            return 'RootNode';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RootNode.prototype, "priority", {
        get: function () {
            return nodepriorities_1.getNodePriority(nodepriorities_1.PRIORITY.ROOT);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RootNode.prototype, "name", {
        get: function () {
            return 'RootNode';
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @todo use this.controllers instead of passing first arg
     * @todo rename to makeControllerIterator
     * @param controllers
     * @param params
     */
    RootNode.prototype.controllersWithParams = function (controllers, params) {
        var _i, controllers_1, controller;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _i = 0, controllers_1 = controllers;
                    _a.label = 1;
                case 1:
                    if (!(_i < controllers_1.length)) return [3 /*break*/, 4];
                    controller = controllers_1[_i];
                    return [4 /*yield*/, {
                            controller: controller,
                            params: params
                        }];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    };
    /**
     * Every node type will be equal to RootNode
     * @param {Node<T>} other
     * @returns {boolean}
     */
    RootNode.prototype.equals = function (other) {
        return (other.id === this.id);
    };
    RootNode.prototype.findChildMatches = function (uri, params) {
        var _i, _a, childNode;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _i = 0, _a = this.children;
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    childNode = _a[_i];
                    return [5 /*yield**/, __values(childNode.findRoutes(uri, params))];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    };
    /**
     * RootNode cannot be matched to any URI
     * it can only find match in child nodes.
     *
     * @param {string} uri
     * @param {UriParams} params
     * @returns {RouteMatchResult<T>}
     */
    RootNode.prototype.findRoute = function (uri, params) {
        return this.findRoutes(uri, params)
            .next().value;
    };
    RootNode.prototype.findRoutes = function (uri, params) {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [5 /*yield**/, __values(this.findChildMatches(uri, params))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    };
    RootNode.prototype.getAllControllers = function () {
        var _i, _a, childNode;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [5 /*yield**/, __values(this.controllers)];
                case 1:
                    _b.sent();
                    _i = 0, _a = this.children;
                    _b.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 5];
                    childNode = _a[_i];
                    return [5 /*yield**/, __values(childNode.getAllControllers())];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/];
            }
        });
    };
    /**
     * Given the URI and controller:
     * extract path segment from uri,
     * make a node from extracted segment
     * Add node as a child node.
     *
     * if no 'tail' after extracting uri segment
     * then also add controller to that child node.
     *
     * if child node already exists:
     * if no tail:
     *  if child node does not have controller
     *   then add controller to it
     *  else throw
     * else have tail
     *  call childNode.addUriController with tail
     *
     * @param {string} uri
     * @param {T} controller
     * @param fullUri: string should not be passed manually. It is passed automatically
     * by parent node to child node so that child nodes have access to the full uri in case
     * it needs it to throw exception. This is used for informational purposes in the exception message
     *
     * @returns {Node<T>}
     */
    RootNode.prototype.addUriController = function (uri, controller, fullUri) {
        if (fullUri === void 0) { fullUri = ''; }
        fullUri = fullUri || uri;
        /**
         * @todo remove the checking existing child node controllers
         * Simplify this method:
         * if uri is empty then:
         *    has equal controller -> exception
         *    else -> add controller to this node
         * else:
         *    split uri, make node from head.
         *    addChildNode
         *    call addUriController on child node, passing tail and controller
         */
        if (!uri) {
            //this.controller = controller;
            //@todo this is wrong. Must check for existing equal controller.
            this.controllers = this.controllers.concat([controller]).sort(function (ctrl1, ctrl2) { return ctrl2.priority - ctrl1.priority; });
            return this;
        }
        var _a = lib_1.splitBySeparator(uri, [interfaces_1.ROUTE_PATH_SEPARATOR]), head = _a.head, tail = _a.tail;
        var childNode = lib_1.makeNode(head);
        /**
         * Loop over children.
         * If child matching this new node already exists
         *
         * then return result of invoking addUriController method
         * on the matched child node with tail as uri parameter
         */
        var existingChildNode = this.children.find(function (node) { return node.equals(childNode); });
        if (existingChildNode) {
            if (tail) {
                return existingChildNode.addUriController(tail, controller, fullUri);
            }
            else {
                /**
                 * Must check if existing node equals to this node AND if this node
                 * is equals to existing node because it's possible that existing node
                 * is not equals to this controller but this controller is a type of controller that
                 * returns true from its equals() method (for example UniqueController)
                 */
                var existingCtrl = existingChildNode.controllers.find(function (ctrl) { return ctrl.equals(controller) || controller.equals(ctrl); });
                /**
                 * No tail
                 * if same node already exists and has equal controller then throw
                 */
                if (existingCtrl) {
                    throw new Error("Cannot add controller \"" + controller.id + "\" for uri \"" + fullUri + "\" to child node \"" + childNode.name + "\" because equal controller \"" + existingCtrl.id + "\" already exists in node");
                }
                else {
                    /**
                     * Same child node exists but does not have same controller
                     * then just add controller to it
                     */
                    existingChildNode.addUriController('', controller);
                    return existingChildNode;
                }
            }
        }
        else {
            /**
             * add this child node to children
             * then invoke addUriController on this child node with tail
             */
            this.addChild(childNode);
            return childNode.addUriController(tail, controller);
        }
    };
    RootNode.prototype.addRoute = function (uri, controller) {
        if (!uri) {
            return this.addController(controller);
        }
        var _a = lib_1.splitBySeparator(uri, [interfaces_1.ROUTE_PATH_SEPARATOR]), head = _a.head, tail = _a.tail;
        var childNode = lib_1.makeNode(head);
        return this.addChildNode(childNode)
            .addRoute(tail, controller);
    };
    /**
     * @todo throw exception if equal child node already exists
     *
     * @param node
     */
    RootNode.prototype.addChild = function (node) {
        this.children = this.children.concat([node]).sort(function (node1, node2) { return node2.priority - node1.priority; });
    };
    RootNode.prototype.addChildNode = function (node) {
        var existingChildNode = this.children.find(function (node) { return node.equals(node); });
        if (existingChildNode) {
            return existingChildNode;
        }
        this.children = this.children.concat([node]).sort(function (node1, node2) { return node2.priority - node1.priority; });
    };
    RootNode.prototype.addController = function (controller) {
        /**
         * Must check if existing node equals to this node AND if this node
         * is equals to existing node because it's possible that existing node
         * is not equals to this controller but this controller is a type of controller that
         * returns true from its equals() method (for example UniqueController)
         */
        var existingCtrl = this.controllers.find(function (ctrl) { return ctrl.equals(controller) || controller.equals(ctrl); });
        if (existingCtrl) {
            var error = "Cannot add controller " + controller.id + " to node " + this.name + " because equal controller " + existingCtrl.id + " already exists";
            throw new Error(error);
        }
        this.controllers = this.controllers.concat([controller]).sort(function (ctrl1, ctrl2) { return ctrl2.priority - ctrl1.priority; });
        return this;
    };
    return RootNode;
}());
exports.RootNode = RootNode;
