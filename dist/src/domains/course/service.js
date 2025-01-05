"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrollCourseService = exports.deleteById = exports.updateById = exports.getById = exports.search = exports.create = void 0;
const logger_1 = __importDefault(require("../../libraries/log/logger"));
const schema_1 = __importDefault(require("./schema"));
const AppError_1 = require("../../libraries/error-handling/AppError");
const coudinary_1 = require("../../utils/coudinary");
const schema_2 = __importDefault(require("../module/schema"));
const schema_3 = __importDefault(require("../video/schema"));
const schema_4 = __importDefault(require("./schema"));
const schema_5 = __importDefault(require("../user/schema"));
const model = 'Course';
const create = async (data) => {
    try {
        const item = new schema_1.default(data);
        const saved = await item.save();
        logger_1.default.info(`create(): ${model} created`, {
            id: saved._id
        });
        return saved;
    }
    catch (error) {
        logger_1.default.error(`create(): Failed to create ${model}`, error);
        throw new AppError_1.AppError(`Failed to create ${model}`, error.message);
    }
};
exports.create = create;
const search = async (query) => {
    try {
        const { keyword, tag, isPublished, limit } = query ?? {};
        const filter = {};
        if (keyword) {
            filter.or = [
                { name: { regex: keyword, options: 'i' } },
                { description: { regex: keyword, options: 'i' } }
            ];
        }
        if (isPublished) {
            filter.isPublished = isPublished === 'true' ? true : false;
        }
        if (tag) {
            filter.tags = tag; // Matches documents where the 'tags' array contains the specified tag
        }
        let queryBuilder = schema_1.default.find(filter);
        if (limit) {
            queryBuilder = queryBuilder.limit(Number(limit));
        }
        const items = await queryBuilder;
        logger_1.default.info('search(): filter and count', {
            filter,
            count: items.length
        });
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
        logger_1.default.info(`getById(): ${model} fetched`, { id });
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
            throw new AppError_1.AppError(`${model} not found`, `${model} not found`, 404);
        }
        if (item.thumbnail?.publicId) {
            await (0, coudinary_1.deleteFromCloudinary)(item.thumbnail.publicId);
        }
        await schema_2.default.deleteMany({ course: item._id });
        await schema_3.default.deleteMany({ course: item._id });
        logger_1.default.info(`deleteById(): ${model} deleted`, { id });
        return true;
    }
    catch (error) {
        logger_1.default.error(`deleteById(): Failed to delete ${model}`, error);
        throw error;
    }
};
exports.deleteById = deleteById;
const enrollCourseService = async (courseId, userId, userEmail, bodyEmail) => {
    try {
        if (!userId) {
            throw new AppError_1.AppError('Authentication error', 'User not logged in', 401);
        }
        //  Validate email
        if (bodyEmail !== userEmail) {
            throw new AppError_1.AppError('Varification Error', 'Email does not match the authenticated user', 403);
        }
        //  Find the course
        const course = await schema_4.default.findById(courseId);
        if (!course) {
            throw new AppError_1.AppError('NotFoundError', 'Course not found', 404);
        }
        //  Find the user
        const user = await schema_5.default.findById(userId);
        if (!user) {
            throw new AppError_1.AppError('NotFoundError', 'User not found', 404);
        }
        //  Check if the user is already enrolled
        if (user.enrolledCourses?.some((enrolledCourse) => enrolledCourse.courseId.toString() === courseId)) {
            throw new AppError_1.AppError('BadRequestError', 'User already enrolled in this course', 400);
        }
        //Enroll the user
        user.enrolledCourses = user.enrolledCourses || [];
        user.enrolledCourses.push({
            courseId: course._id,
            progress: 0,
            completedModules: [],
            watchedVideos: [],
            enrolledAt: new Date()
        });
        await user.save();
        //  Update the course's enrolled students count
        course.enrolledStudents += 1;
        await course.save();
        return course;
    }
    catch (error) {
        // Log the error for debugging purposes
        logger_1.default.error(`enrollCourseService(): Failed to enroll ${model}`, error);
        throw error;
    }
};
exports.enrollCourseService = enrollCourseService;
//# sourceMappingURL=service.js.map