"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = validateRequest;
const validator_1 = __importDefault(require("validator"));
const logger_1 = __importDefault(require("../../libraries/log/logger"));
const AppError_1 = require("../../libraries/error-handling/AppError");
function validateRequest({ schema, isParam = false, isQuery = false }) {
    return (req, res, next) => {
        const input = isParam ? req.params : isQuery ? req.query : req.body;
        // Sanitize inputs
        for (const key in input) {
            if (typeof input[key] === 'string') {
                input[key] = validator_1.default.escape(input[key]);
            }
        }
        const validationResult = schema.validate(input, {
            abortEarly: false
        });
        if (validationResult.error) {
            const messages = validationResult.error.details.map((detail) => detail.message);
            logger_1.default.error(`${req.method} ${req.originalUrl} Validation failed`, {
                errors: messages
            });
            throw new AppError_1.ValidationError(messages.join(', ')); // Combine messages for clarity
        }
        // Attach validation result back to the original field
        if (isParam) {
            req.params = validationResult.value;
        }
        else if (isQuery) {
            req.query = validationResult.value;
        }
        else {
            req.body = validationResult.value;
        }
        // Validation successful - proceed
        next();
    };
}
//# sourceMappingURL=index.js.map