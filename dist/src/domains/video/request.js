"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.idSchema = exports.updateSchema = exports.createSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const mongoose_1 = __importDefault(require("mongoose"));
const createSchema = joi_1.default.object({
    title: joi_1.default.string().required(),
    description: joi_1.default.string().allow('').optional(),
    videoId: joi_1.default.string().required(),
    module: joi_1.default.string()
        .custom((value, helpers) => {
        if (!mongoose_1.default.isValidObjectId(value)) {
            return helpers.error('any.invalid');
        }
        return value;
    })
        .required(),
    course: joi_1.default.string()
        .custom((value, helpers) => {
        if (!mongoose_1.default.isValidObjectId(value)) {
            return helpers.error('any.invalid');
        }
        return value;
    })
        .required(),
    duration: joi_1.default.number().min(0).required(),
    order: joi_1.default.number().integer().min(0).required(),
    watchedBy: joi_1.default.array()
        .items(joi_1.default.string().custom((value, helpers) => {
        if (!mongoose_1.default.isValidObjectId(value)) {
            return helpers.error('any.invalid');
        }
        return value;
    }))
        .optional()
});
exports.createSchema = createSchema;
const updateSchema = joi_1.default.object({
    title: joi_1.default.string().optional(),
    description: joi_1.default.string().allow('').optional(),
    videoId: joi_1.default.string().optional(),
    module: joi_1.default.string()
        .custom((value, helpers) => {
        if (!mongoose_1.default.isValidObjectId(value)) {
            return helpers.error('any.invalid');
        }
        return value;
    })
        .optional(),
    course: joi_1.default.string()
        .custom((value, helpers) => {
        if (!mongoose_1.default.isValidObjectId(value)) {
            return helpers.error('any.invalid');
        }
        return value;
    })
        .optional(),
    duration: joi_1.default.number().min(0).optional(),
    order: joi_1.default.number().integer().min(0).optional(),
    watchedBy: joi_1.default.array()
        .items(joi_1.default.string().custom((value, helpers) => {
        if (!mongoose_1.default.isValidObjectId(value)) {
            return helpers.error('any.invalid');
        }
        return value;
    }))
        .optional() // WatchedBy remains optional
}).min(1);
exports.updateSchema = updateSchema;
const idSchema = joi_1.default.object().keys({
    id: joi_1.default.string()
        .custom((value, helpers) => {
        if (!mongoose_1.default.Types.ObjectId.isValid(value)) {
            return helpers.error('any.invalid');
        }
        return value;
    }, 'ObjectId validation')
        .required()
});
exports.idSchema = idSchema;
