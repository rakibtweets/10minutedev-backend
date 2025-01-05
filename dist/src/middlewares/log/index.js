"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRequest = void 0;
const logger_1 = __importDefault(require("../../libraries/log/logger"));
// Middleware to log the request
const logRequest = ({ fields = [] } = {}) => {
    return (req, res, next) => {
        const logData = {};
        if (req.params) {
            logData.params = req.params;
        }
        if (req.query) {
            logData.query = req.query;
        }
        if (req.body) {
            if (fields && fields.length > 0) {
                fields.forEach((field) => {
                    if (req.body[field] !== undefined) {
                        logData[field] = req.body[field];
                    }
                });
            }
            else {
                logData.body = req.body;
            }
        }
        logger_1.default.info(`${req.method} ${req.originalUrl}`, logData);
        // Store the original end method
        const oldEnd = res.end;
        // Override the end method
        res.end = function (...args) {
            logger_1.default.info(`${req.method} ${req.originalUrl}`, {
                statusCode: res.statusCode
            });
            //@ts-ignore
            return oldEnd.apply(this, args);
        };
        next();
    };
};
exports.logRequest = logRequest;
//# sourceMappingURL=index.js.map