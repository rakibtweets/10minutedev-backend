"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
const logger_1 = __importDefault(require("../../libraries/log/logger"));
const AppError_1 = require("../../libraries/error-handling/AppError");
// Authentication Middleware
const isAuthenticated = async (req, res, next) => {
    // Passport's built-in method attached to the request object
    try {
        if (req.isAuthenticated()) {
            return next();
        }
        else {
            logger_1.default.warn('User is not authenticated');
            throw new AppError_1.AppError('Unauthenticated', 'User Not authenticated', 401);
        }
    }
    catch (error) {
        next(error);
    }
};
exports.isAuthenticated = isAuthenticated;
//# sourceMappingURL=authentication.js.map