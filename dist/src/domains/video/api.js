"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const express_1 = __importDefault(require("express"));
const logger_1 = __importDefault(require("../../libraries/log/logger"));
const AppError_1 = require("../../libraries/error-handling/AppError");
const service_1 = require("./service");
const request_1 = require("./request");
const request_validate_1 = require("../../middlewares/request-validate");
const log_1 = require("../../middlewares/log");
const authentication_1 = require("../../middlewares/auth/authentication");
const authorization_1 = require("../../middlewares/auth/authorization");
const model = 'Video';
// CRUD for entity
const routes = () => {
    const router = express_1.default.Router();
    logger_1.default.info(`Setting up routes for ${model}`);
    router.get('/', (0, log_1.logRequest)({}), async (req, res, next) => {
        try {
            const items = await (0, service_1.search)(req.query);
            res.json(items);
        }
        catch (error) {
            next(error);
        }
    });
    router.post('/', (0, log_1.logRequest)({}), authentication_1.isAuthenticated, authorization_1.isAuthorized, (0, request_validate_1.validateRequest)({ schema: request_1.createSchema }), async (req, res, next) => {
        try {
            const item = await (0, service_1.create)(req.body);
            res.status(201).json(item);
        }
        catch (error) {
            next(error);
        }
    });
    router.get('/:id', (0, log_1.logRequest)({}), (0, request_validate_1.validateRequest)({ schema: request_1.idSchema, isParam: true }), async (req, res, next) => {
        try {
            const item = await (0, service_1.getById)(req.params.id);
            if (!item) {
                throw new AppError_1.AppError(`${model} not found`, `${model} not found`, 404);
            }
            res.status(200).json(item);
        }
        catch (error) {
            next(error);
        }
    });
    router.put('/:id', (0, log_1.logRequest)({}), authentication_1.isAuthenticated, authorization_1.isAuthorized, (0, request_validate_1.validateRequest)({ schema: request_1.idSchema, isParam: true }), (0, request_validate_1.validateRequest)({ schema: request_1.updateSchema }), async (req, res, next) => {
        try {
            const item = await (0, service_1.updateById)(req.params.id, req.body);
            if (!item) {
                throw new AppError_1.AppError(`${model} not found`, `${model} not found`, 404);
            }
            res.status(200).json(item);
        }
        catch (error) {
            next(error);
        }
    });
    router.put('/:id/watched', (0, log_1.logRequest)({}), authentication_1.isAuthenticated, async (req, res, next) => {
        try {
            const userId = req.user?._id || '';
            const videoId = req.params.id;
            const item = await (0, service_1.markVideoAsWatched)(userId, videoId);
            console.log('watched', item);
            if (!item) {
                throw new AppError_1.AppError(`${model} not found`, `${model} not found`, 404);
            }
            res.status(200).json(item);
        }
        catch (error) {
            next(error);
        }
    });
    router.delete('/:id', (0, log_1.logRequest)({}), authentication_1.isAuthenticated, authorization_1.isAuthorized, (0, request_validate_1.validateRequest)({ schema: request_1.idSchema, isParam: true }), async (req, res, next) => {
        try {
            await (0, service_1.deleteById)(req.params.id);
            res.status(204).json({ message: `${model} is deleted` });
        }
        catch (error) {
            next(error);
        }
    });
    return router;
};
exports.routes = routes;
