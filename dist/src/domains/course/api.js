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
const coudinary_1 = require("../../utils/coudinary");
const schema_1 = __importDefault(require("./schema"));
const authentication_1 = require("../../middlewares/auth/authentication");
const authorization_1 = require("../../middlewares/auth/authorization");
const model = 'Course';
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
        const { thumbnail } = req.body;
        try {
            //@ts-ignore
            const result = await (0, coudinary_1.uploadToCloudinary)(req.body.thumbnail.url, 'course');
            thumbnail.url = result.secure_url;
            thumbnail.publicId = result.public_id;
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
        console.log('req query', req.query);
        try {
            const { thumbnail } = req.body;
            const course = await schema_1.default.findById(req.params.id);
            if (!course) {
                throw new AppError_1.AppError(`${model} not found`, `${model} not found`, 404);
            }
            if (thumbnail?.url && thumbnail?.url !== course?.thumbnail.url) {
                const result = await (0, coudinary_1.uploadToCloudinary)(thumbnail.url, 'course');
                thumbnail.url = result.secure_url;
                thumbnail.publicId = result.public_id;
                console.log('new thumbnail');
                // delete the old thumbnail
                if (course?.thumbnail.publicId) {
                    await (0, coudinary_1.deleteFromCloudinary)(course?.thumbnail?.publicId);
                    console.log('old thumbnail deleted');
                }
            }
            else {
                //@ts-ignore
                thumbnail.url = course?.thumbnail.url;
                //@ts-ignore
                thumbnail.public_id = course?.thumbnail.public_id;
                console.log('old thumbnail');
            }
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
    router.put('/:id/publish', (0, log_1.logRequest)({}), authentication_1.isAuthenticated, authorization_1.isAuthorized, (0, request_validate_1.validateRequest)({ schema: request_1.idSchema, isParam: true }), (0, request_validate_1.validateRequest)({ schema: request_1.publishSchema }), async (req, res, next) => {
        try {
            const { id } = req.params;
            const { isPublished } = req.body;
            // Validate that 'isPublished' exists and is a valid boolean
            if (isPublished === undefined) {
                throw new AppError_1.AppError("'isPublished' field is required in the request body", 'Validation Error', 400);
            }
            const isValidBoolean = typeof isPublished === 'boolean';
            if (!isValidBoolean) {
                throw new AppError_1.AppError("'isPublished' must be a boolean value (true or false)", 'Validation Error', 400);
            }
            // Update only the 'isPublished' property in the document
            const course = await schema_1.default.findByIdAndUpdate(id, // Course ID
            { isPublished }, { new: true, runValidators: true } // Return updated document and run validators
            );
            if (!course) {
                throw new AppError_1.AppError(`${model} not found`, `${model} not found`, 404);
            }
            res.status(200).json(course);
        }
        catch (error) {
            next(error);
        }
    });
    router.post('/:id/enroll', (0, log_1.logRequest)({}), authentication_1.isAuthenticated, (0, request_validate_1.validateRequest)({ schema: request_1.idSchema, isParam: true }), (0, request_validate_1.validateRequest)({ schema: request_1.emailSchema }), async (req, res, next) => {
        const { id: courseId } = req.params;
        const { email } = req.body;
        const userId = req.user?._id || '';
        const userEmail = req.user?.email;
        try {
            // Call the service to handle the enrollment logic
            const enrolledCourse = await (0, service_1.enrollCourseService)(courseId, userId, userEmail, email);
            res.status(200).json(enrolledCourse);
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
