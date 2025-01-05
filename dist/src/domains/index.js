"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = __importDefault(require("./user"));
const course_1 = __importDefault(require("./course"));
const module_1 = __importDefault(require("./module"));
const video_1 = __importDefault(require("./video"));
const defineRoutes = async (expressRouter) => {
    (0, user_1.default)(expressRouter);
    (0, course_1.default)(expressRouter);
    (0, module_1.default)(expressRouter);
    (0, video_1.default)(expressRouter);
};
exports.default = defineRoutes;
//# sourceMappingURL=index.js.map