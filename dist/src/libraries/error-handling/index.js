"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandlerMiddleware = exports.errorHandler = void 0;
const logger_1 = __importDefault(require("../log/logger"));
const util_1 = require("util");
const AppError_1 = require("./AppError");
const mongoose_1 = __importDefault(require("mongoose"));
let httpServerRef;
const errorHandler = {
    listenToErrorEvents: () => {
        process.on('uncaughtException', async (error) => {
            await errorHandler.handleError(error);
        });
        process.on('unhandledRejection', async (reason) => {
            await errorHandler.handleError(reason);
        });
        process.on('SIGTERM', async () => {
            logger_1.default.error('App received SIGTERM event, try to gracefully close the server');
            await terminateHttpServerAndExit();
        });
        process.on('SIGINT', async () => {
            logger_1.default.error('App received SIGINT event, try to gracefully close the server');
            await terminateHttpServerAndExit();
        });
    },
    handleError: async (errorToHandle) => {
        try {
            const appError = normalizeError(errorToHandle);
            console.log('handleError:  appError:', { appError });
            logger_1.default.error(appError.message, appError);
            if (!appError.isTrusted) {
                await terminateHttpServerAndExit();
            }
            return appError;
        }
        catch (handlingError) {
            // No logger here since it might have failed
            process.stdout.write('The error handler failed. Here are the handler failure and then the origin error that it tried to handle: ');
            process.stdout.write(JSON.stringify(handlingError));
            process.stdout.write(JSON.stringify(errorToHandle));
        }
    }
};
exports.errorHandler = errorHandler;
const terminateHttpServerAndExit = async () => {
    // @ts-ignore
    if (httpServerRef) {
        await new Promise((resolve) => httpServerRef.close(() => resolve())); // Graceful shutdown
    }
    process.exit();
};
const normalizeError = (errorToHandle) => {
    if (errorToHandle instanceof AppError_1.AppError) {
        console.log('normalizeError  errorToHandle:', { errorToHandle });
        return errorToHandle;
    }
    if (errorToHandle instanceof Error) {
        const appError = new AppError_1.AppError(errorToHandle.name, errorToHandle.message);
        appError.stack = errorToHandle.stack;
        console.log('normalizeError  appError:', { appError });
        return appError;
    }
    const inputType = typeof errorToHandle;
    return new AppError_1.AppError('general-error', `Error Handler received a non-error instance with type - ${inputType}, value - ${(0, util_1.inspect)(errorToHandle)}`);
};
const errorHandlerMiddleware = (errorHandler) => {
    let error = errorHandler;
    // Check if the error is an instance of an ApiError class which extends native Error class
    if (!(error instanceof AppError_1.AppError)) {
        // if not
        // create a new ApiError instance to keep the consistency
        // assign an appropriate status code
        const HTTPStatus = error.HTTPStatus || error instanceof mongoose_1.default.Error ? 400 : 500;
        // set a message from native Error instance or a custom one
        const message = error.message || 'Internal server error';
        error = new AppError_1.AppError(error.name, message, HTTPStatus);
    }
    // Now we are sure that the `error` variable will be an instance of ApiError class
    const response = {
        ...error,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}) // Error stack traces should be visible in development for debugging
    };
    logger_1.default.error(response.message, response);
    // Send error response
    return response;
};
exports.errorHandlerMiddleware = errorHandlerMiddleware;
//# sourceMappingURL=index.js.map