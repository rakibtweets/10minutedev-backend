"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveRequestId = exports.addRequestIdMiddleware = void 0;
const async_hooks_1 = require("async_hooks");
const crypto_1 = require("crypto");
const requestContextStore = new async_hooks_1.AsyncLocalStorage();
const REQUEST_ID_HEADER_NAME = 'x-request-id';
const generateRequestId = () => (0, crypto_1.randomUUID)();
const addRequestIdMiddleware = (req, res, next) => {
    const existingRequestId = req.headers[REQUEST_ID_HEADER_NAME];
    const requestId = existingRequestId || generateRequestId();
    res.setHeader(REQUEST_ID_HEADER_NAME, requestId);
    requestContextStore.run(new Map(), () => {
        requestContextStore.getStore()?.set('requestId', requestId);
        next();
    });
};
exports.addRequestIdMiddleware = addRequestIdMiddleware;
// Accessing the request ID in subsequent middleware or routes
const retrieveRequestId = () => requestContextStore.getStore()?.get('requestId');
exports.retrieveRequestId = retrieveRequestId;
