"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("./api");
const defineRoutes = (expressRouter) => {
    expressRouter.use('/modules', (0, api_1.routes)());
};
exports.default = defineRoutes;
