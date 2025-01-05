"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthorized = void 0;
const AppError_1 = require("../../libraries/error-handling/AppError");
// Authorization Middleware
const isAuthorized = (req, res, next) => {
    try {
        if (req.user?.isAdmin) {
            next();
        }
        else {
            throw new AppError_1.AppError('Unauthorized', 'Access denied. You are not an admin.', 403);
        }
    }
    catch (error) {
        next(error);
    }
};
exports.isAuthorized = isAuthorized;
