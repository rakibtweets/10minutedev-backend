"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markVideoAsWatched = exports.deleteById = exports.updateById = exports.getById = exports.search = exports.create = void 0;
const logger_1 = __importDefault(require("../../libraries/log/logger"));
const schema_1 = __importDefault(require("./schema"));
const AppError_1 = require("../../libraries/error-handling/AppError");
const schema_2 = __importDefault(require("../module/schema"));
const schema_3 = __importDefault(require("../course/schema"));
const schema_4 = __importDefault(require("../user/schema"));
const schema_5 = __importDefault(require("./schema"));
const model = 'Video';
const create = async (data) => {
    try {
        const { module } = data;
        if (!module) {
            throw new AppError_1.AppError('Module is required', 'Module is required', 400);
        }
        const exsistingModule = await schema_2.default.findById(module);
        if (!exsistingModule) {
            throw new AppError_1.AppError('Course not found', 'Course not found', 404);
        }
        const video = new schema_1.default(data);
        const savedVideo = await video.save();
        if (!exsistingModule.videos) {
            exsistingModule.videos = [];
        }
        exsistingModule.videos.push(video._id);
        exsistingModule.duration += video.duration;
        await exsistingModule.save();
        await schema_3.default.findByIdAndUpdate(video.course, {
            $inc: { noOfVideos: 1, duration: video.duration }
        });
        logger_1.default.info(`create(): ${model} created`, {
            id: savedVideo._id
        });
        return savedVideo;
    }
    catch (error) {
        logger_1.default.error(`create(): Failed to create ${model} `, error);
        throw new AppError_1.AppError(`Failed to create ${model} `, error.message);
    }
};
exports.create = create;
const search = async (query) => {
    try {
        const { keyword, moduleId } = query ?? {};
        const filter = {};
        if (moduleId) {
            // Ensure moduleId is a valid ObjectId and match it exactly
            filter.module = moduleId;
        }
        if (keyword) {
            filter.or = [
                { name: { regex: keyword, options: 'i' } },
                { description: { regex: keyword, options: 'i' } }
            ];
        }
        const items = await schema_1.default.find(filter);
        if (!items) {
            throw new AppError_1.AppError('Not found', `Failed to search ${model} `, 404);
        }
        logger_1.default.info('search(): filter and count', {
            filter,
            count: items.length
        });
        return items;
    }
    catch (error) {
        logger_1.default.error(`search(): Failed to search ${model} `, error);
        throw error;
    }
};
exports.search = search;
const getById = async (id) => {
    try {
        const item = await schema_1.default.findById(id);
        if (!item) {
            throw new AppError_1.AppError('Not found', `Failed to get ${model} `, 404);
        }
        logger_1.default.info(`getById(): model fetched`, { id });
        return item;
    }
    catch (error) {
        logger_1.default.error(`getById(): Failed to get ${model} `, error);
        throw error;
    }
};
exports.getById = getById;
const updateById = async (id, data) => {
    try {
        const { duration } = data;
        const originalItem = await schema_1.default.findById(id);
        if (!originalItem) {
            throw new AppError_1.AppError(`${model} not found`, `${model} not found`, 404);
        }
        const durationDifference = duration - originalItem.duration;
        const updatedItem = await schema_1.default.findByIdAndUpdate(id, data, { new: true });
        if (!updatedItem) {
            throw new AppError_1.AppError(`${model} not found after update`, `${model} not found after update`, 404);
        }
        // Update the associated module's duration
        await schema_2.default.findByIdAndUpdate(originalItem.module, {
            $inc: { duration: durationDifference }
        });
        await schema_3.default.findByIdAndUpdate(originalItem.course, {
            $inc: { duration: durationDifference }
        });
        logger_1.default.info(`updateById(): model updated`, { id });
        return updatedItem;
    }
    catch (error) {
        logger_1.default.error(`updateById(): Failed to update ${model} `, error);
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
        await schema_2.default.findByIdAndUpdate(item.module, {
            $pull: { videos: item._id },
            $inc: { duration: -item.duration }
        });
        await schema_3.default.findByIdAndUpdate(item.course, {
            $inc: { noOfVideos: -1, duration: -item.duration }
        });
        logger_1.default.info(`deleteById(): ${model}  deleted`, { id });
        return true;
    }
    catch (error) {
        logger_1.default.error(`deleteById(): Failed to delete ${model} `, error);
        throw error;
    }
};
exports.deleteById = deleteById;
const markVideoAsWatched = async (userId, videoId) => {
    try {
        // Mark video as watched
        const updatedItem = await schema_1.default.findOneAndUpdate({ videoId }, {
            $addToSet: { watchedBy: userId }
        });
        const video = await schema_5.default.findById(updatedItem?._id);
        if (!video) {
            throw new AppError_1.AppError('Video not found', 'Video not found', 404);
        }
        // Update user's watched videos
        const user = await schema_4.default.findByIdAndUpdate(userId, {
            $addToSet: { 'enrolledCourses.$[course].watchedVideos': video._id }
        }, {
            arrayFilters: [{ 'course.courseId': video.course }]
        });
        if (!user) {
            throw new AppError_1.AppError('User not found', 'User not found', 404);
        }
        // Check if module is completed
        const module = await schema_2.default.findById(video.module);
        if (!module) {
            throw new AppError_1.AppError('Module not found', 'Module not found', 404);
        }
        const allVideosInModule = await schema_5.default.find({ module: video.module });
        const enrolledCourse = user?.enrolledCourses?.find((c) => c.courseId.toString() === video.course.toString());
        const courseEnrollment = user?.enrolledCourses?.find((c) => c.courseId.toString() === video.course.toString());
        const allVideosWatched = allVideosInModule.every((v) => courseEnrollment?.watchedVideos.includes(v._id));
        if (allVideosWatched) {
            await schema_4.default.findByIdAndUpdate(userId, {
                $addToSet: {
                    'enrolledCourses.$[course].completedModules': module._id
                }
            }, {
                arrayFilters: [{ 'course.courseId': video.course }]
            });
        }
        // Update course progress
        const totalVideos = await schema_5.default.countDocuments({ course: video.course });
        const watchedVideosCount = enrolledCourse?.watchedVideos.length || 0;
        const progress = (watchedVideosCount / totalVideos) * 100;
        await schema_4.default.findOneAndUpdate({
            _id: userId,
            'enrolledCourses.courseId': video.course
        }, {
            $set: { 'enrolledCourses.$.progress': progress }
        });
        return updatedItem;
    }
    catch (error) {
        logger_1.default.error(`markVideoAsWatched(): Failed to delete ${model} `, error);
        throw error;
    }
};
exports.markVideoAsWatched = markVideoAsWatched;
//# sourceMappingURL=service.js.map