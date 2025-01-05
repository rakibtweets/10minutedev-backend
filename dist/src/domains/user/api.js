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
const model = 'User';
// CRUD for entity
const routes = () => {
    const router = express_1.default.Router();
    logger_1.default.info(`Setting up routes for model`);
    router.get('/', (0, log_1.logRequest)({}), async (req, res, next) => {
        try {
            const items = await (0, service_1.search)(req.query);
            res.json(items);
        }
        catch (error) {
            next(error);
        }
    });
    // create loggin in user enrolled courses
    router.get('/enrolled-courses', (0, log_1.logRequest)({}), authentication_1.isAuthenticated, async (req, res, next) => {
        const userId = req.user?._id || '';
        try {
            const enrolledCourses = await (0, service_1.getEnrolledCoursesService)(userId);
            res.status(200).json(enrolledCourses);
        }
        catch (error) {
            next(error);
        }
    });
    router.get('/admin-stats', (0, log_1.logRequest)({}), authentication_1.isAuthenticated, authorization_1.isAuthorized, async (req, res, next) => {
        try {
            const stats = await (0, service_1.getAdminDashboardStats)();
            res.status(200).json(stats);
        }
        catch (error) {
            next(error);
        }
    });
    router.get('/dashboard', (0, log_1.logRequest)({}), authentication_1.isAuthenticated, authorization_1.isAuthorized, async (req, res, next) => {
        const userId = req.user?._id || '';
        try {
            const enrolledCourses = await (0, service_1.getUserStatisticsAndCourses)(userId);
            res.status(200).json(enrolledCourses);
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
    router.put('/:id', (0, log_1.logRequest)({}), authentication_1.isAuthenticated, (0, request_validate_1.validateRequest)({ schema: request_1.idSchema, isParam: true }), (0, request_validate_1.validateRequest)({ schema: request_1.updateSchema }), async (req, res, next) => {
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
    router.delete('/:id', (0, log_1.logRequest)({}), authentication_1.isAuthenticated, (0, request_validate_1.validateRequest)({ schema: request_1.idSchema, isParam: true }), async (req, res, next) => {
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
