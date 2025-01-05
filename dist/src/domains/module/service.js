"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteById = exports.updateById = exports.getById = exports.search = exports.create = void 0;
const logger_1 = __importDefault(require("../../libraries/log/logger"));
const schema_1 = __importDefault(require("./schema"));
const AppError_1 = require("../../libraries/error-handling/AppError");
const schema_2 = __importDefault(require("../course/schema"));
const schema_3 = __importDefault(require("../video/schema"));
const model = 'Module';
const create = async (data) => {
    try {
        const { course } = data;
        if (!course) {
            throw new AppError_1.AppError('Course is required', 'Course is required', 400);
        }
        const existingCourse = await schema_2.default.findById(course);
        if (!existingCourse) {
            throw new AppError_1.AppError('Course not found', 'Course not found', 404);
        }
        const module = new schema_1.default(data);
        const savedModule = await module.save();
        if (!existingCourse.modules) {
            existingCourse.modules = [];
        }
        existingCourse.modules.push(module._id);
        await existingCourse.save();
        logger_1.default.info(`create(): ${model} created`, {
            id: savedModule._id
        });
        return savedModule;
    }
    catch (error) {
        logger_1.default.error(`create(): Failed to create ${model}`, error);
        throw new AppError_1.AppError(`Failed to create ${model}`, error.message);
    }
};
exports.create = create;
const search = async (query) => {
    try {
        const { keyword, courseId, videoId } = query ?? {};
        const filter = {};
        if (courseId) {
            // Ensure courseId is a valid ObjectId and match it exactly
            filter.course = courseId;
        }
        if (keyword) {
            filter.or = [
                { title: { regex: keyword, options: 'i' } },
                { description: { regex: keyword, options: 'i' } }
            ];
        }
        const items = await schema_1.default.find(filter).populate({
            path: 'videos',
            select: `_id title duration ${videoId === 'true' ? 'videoId watchedBy' : ''}`
        });
        logger_1.default.info('search(): filter and count', {
            filter,
            count: items.length
        });
        if (!items) {
            throw new AppError_1.AppError('Not found', `Failed to search ${model}`, 404);
        }
        return items;
    }
    catch (error) {
        logger_1.default.error(`search(): Failed to search ${model}`, error);
        throw error;
    }
};
exports.search = search;
const getById = async (id) => {
    try {
        const item = await schema_1.default.findById(id);
        logger_1.default.info(`getById(): model fetched`, { id });
        if (!item) {
            throw new AppError_1.AppError('Not found', `Failed to get ${model}`, 404);
        }
        return item;
    }
    catch (error) {
        logger_1.default.error(`getById(): Failed to get ${model}`, error);
        throw error;
    }
};
exports.getById = getById;
const updateById = async (id, data) => {
    try {
        const item = await schema_1.default.findByIdAndUpdate(id, data, { new: true });
        logger_1.default.info(`updateById(): ${model} updated`, { id });
        if (!item) {
            throw new AppError_1.AppError('Not found', `Failed to update ${model}`, 404);
        }
        return item;
    }
    catch (error) {
        logger_1.default.error(`updateById(): Failed to update ${model}`, error);
        throw error;
    }
};
exports.updateById = updateById;
const deleteById = async (id) => {
    try {
        const item = await schema_1.default.findByIdAndDelete(id);
        if (!item) {
            throw new AppError_1.AppError('Not found', `Failed to delete ${model}`, 404);
        }
        await schema_2.default.findByIdAndUpdate(item.course, {
            $pull: { modules: item._id }
        });
        await schema_3.default.deleteMany({ module: item._id });
        logger_1.default.info(`deleteById(): ${model} deleted`, { id });
        return true;
    }
    catch (error) {
        logger_1.default.error(`deleteById(): Failed to delete ${model}`, error);
        throw error;
    }
};
exports.deleteById = deleteById;
