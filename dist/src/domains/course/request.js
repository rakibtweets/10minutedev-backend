"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailSchema = exports.publishSchema = exports.idSchema = exports.updateSchema = exports.createSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const mongoose_1 = __importDefault(require("mongoose"));
// const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
// const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const createSchema = joi_1.default.object({
    title: joi_1.default.string().min(3).max(100).required(),
    description: joi_1.default.string().min(10).required(),
    thumbnail: joi_1.default.object({
        url: joi_1.default.string().required(),
        publicId: joi_1.default.string().optional().allow('')
    }),
    instructor: joi_1.default.string().min(3).max(100).required(), // MongoDB ObjectId validation
    modules: joi_1.default.array()
        .items(joi_1.default.string().custom((value, helpers) => {
        if (!mongoose_1.default.Types.ObjectId.isValid(value)) {
            return helpers.error('any.invalid', { value });
        }
        return value;
    }, 'ObjectId validation'))
        .optional(),
    enrolledStudents: joi_1.default.number().integer().min(0).default(0),
    price: joi_1.default.number().precision(2).min(0).optional(),
    level: joi_1.default.string().valid('beginner', 'intermediate', 'advanced').required(),
    tags: joi_1.default.array().items(joi_1.default.string().required()).min(1).messages({
        'array.min': 'Please at least one item',
        'string.base': 'Tags must be strings',
        'any.required': 'Tags are required'
    }),
    isPublished: joi_1.default.boolean().default(false)
});
exports.createSchema = createSchema;
const updateSchema = joi_1.default.object({
    title: joi_1.default.string().min(3).max(100).optional(),
    description: joi_1.default.string().min(10).optional(),
    thumbnail: joi_1.default.object({
        url: joi_1.default.string().optional(),
        publicId: joi_1.default.string().optional().allow('')
    }).optional(),
    instructor: joi_1.default.string().min(3).max(100).optional(), // MongoDB ObjectId validation
    modules: joi_1.default.array()
        .items(joi_1.default.string().custom((value, helpers) => {
        if (!mongoose_1.default.Types.ObjectId.isValid(value)) {
            return helpers.error('any.invalid', { value });
        }
        return value;
    }, 'ObjectId validation'))
        .optional(),
    // Duration in minutes
    enrolledStudents: joi_1.default.number().integer().min(0).optional(),
    price: joi_1.default.number().precision(2).min(0).optional(),
    level: joi_1.default.string().valid('beginner', 'intermediate', 'advanced').optional(),
    tags: joi_1.default.array().items(joi_1.default.string().required()).min(1).optional().messages({
        'array.min': 'Please at least one item',
        'string.base': 'Tags must be strings',
        'any.required': 'Tags are required'
    }),
    isPublished: joi_1.default.boolean().optional()
}).min(1);
exports.updateSchema = updateSchema;
const emailSchema = joi_1.default.object({
    email: joi_1.default.string().email().required()
});
exports.emailSchema = emailSchema;
const publishSchema = joi_1.default.object({
    isPublished: joi_1.default.boolean().required().messages({
        'any.required': "'isPublished' field is required.",
        'boolean.base': "'isPublished' must be a boolean value (true or false)."
    })
});
exports.publishSchema = publishSchema;
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
//# sourceMappingURL=request.js.map