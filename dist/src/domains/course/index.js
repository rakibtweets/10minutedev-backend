"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("./api");
const defineRoutes = (expressRouter) => {
    expressRouter.use('/courses', (0, api_1.routes)());
};
exports.default = defineRoutes;
//# sourceMappingURL=index.js.map