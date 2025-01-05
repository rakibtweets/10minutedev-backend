"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.context = context;
const async_hooks_1 = require("async_hooks");
let currentContext;
function context() {
    if (currentContext === undefined) {
        currentContext = new async_hooks_1.AsyncLocalStorage();
    }
    return currentContext;
}
//# sourceMappingURL=context.js.map