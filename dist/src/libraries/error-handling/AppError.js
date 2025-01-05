"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    constructor(name, message, HTTPStatus = 500, isTrusted = true, cause = null) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
        this.name = name;
        this.HTTPStatus = HTTPStatus;
        this.isTrusted = isTrusted;
        this.cause = cause;
        // console.log(this);
        // Setting the prototype explicitly to fix issues with instanceof
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message, cause = null) {
        super('ValidationError', message, 400, true, cause);
    }
}
exports.ValidationError = ValidationError;
