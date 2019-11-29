"use strict";
exports.__esModule = true;
var UniqueController = /** @class */ (function () {
    function UniqueController(controller, id) {
        if (id === void 0) { id = 'UniqueController'; }
        this.controller = controller;
        this.id = id;
    }
    /**
     * To make a contoller unique it must
     * return true here. This will make it impossible
     * to add 2 of these controllers to the same node.
     * @param controller
     */
    UniqueController.prototype.equals = function (other) {
        return true;
    };
    Object.defineProperty(UniqueController.prototype, "priority", {
        get: function () {
            return 1;
        },
        enumerable: true,
        configurable: true
    });
    return UniqueController;
}());
exports.UniqueController = UniqueController;
var UniqueStringController = /** @class */ (function () {
    function UniqueStringController(controller) {
        this.controller = controller;
    }
    Object.defineProperty(UniqueStringController.prototype, "id", {
        get: function () {
            return "UniqueStringController::" + this.controller;
        },
        enumerable: true,
        configurable: true
    });
    UniqueStringController.prototype.equals = function (other) {
        return other instanceof UniqueStringController && other.controller === this.controller;
    };
    Object.defineProperty(UniqueStringController.prototype, "priority", {
        get: function () {
            return 1;
        },
        enumerable: true,
        configurable: true
    });
    return UniqueStringController;
}());
exports.UniqueStringController = UniqueStringController;
