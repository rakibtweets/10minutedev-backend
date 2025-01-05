"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminDashboardStats = exports.getUserStatisticsAndCourses = exports.getEnrolledCoursesService = exports.getByGoogleId = exports.getByGitHubId = exports.deleteById = exports.updateById = exports.getById = exports.search = exports.create = void 0;
const logger_1 = __importDefault(require("../../libraries/log/logger"));
const schema_1 = __importDefault(require("./schema"));
const AppError_1 = require("../../libraries/error-handling/AppError");
const schema_2 = __importDefault(require("./schema"));
const schema_3 = __importDefault(require("../course/schema"));
const schema_4 = __importDefault(require("../video/schema"));
const schema_5 = __importDefault(require("../module/schema"));
const model = 'User';
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
        logger_1.default.error(`create(): Failed to ${model} model`, error);
        throw new AppError_1.AppError(`Failed to create ${model}`, error.message);
    }
};
exports.create = create;
const search = async (query) => {
    try {
        const { keyword } = query ?? {};
        const filter = {};
        if (keyword) {
            filter.or = [
                { name: { regex: keyword, options: 'i' } },
                { description: { regex: keyword, options: 'i' } }
            ];
        }
        const items = await schema_1.default.find(filter);
        logger_1.default.info('search(): filter and count', {
            filter,
            count: items.length
        });
        return items;
    }
    catch (error) {
        logger_1.default.error(`search(): Failed to search ${model}`, error);
        throw new AppError_1.AppError(`Failed to search ${model}`, error.message, 400);
    }
};
exports.search = search;
const getByGitHubId = async (githubId) => {
    return await schema_1.default.findOne({ 'github.id': githubId });
};
exports.getByGitHubId = getByGitHubId;
// Add this new function
const getByGoogleId = async (googleId) => {
    return await schema_1.default.findOne({ 'google.id': googleId });
};
exports.getByGoogleId = getByGoogleId;
const getById = async (id) => {
    try {
        const item = await schema_1.default.findById(id);
        if (!item) {
            throw new AppError_1.AppError('Not found', `Failed to get ${model}`, 404);
        }
        logger_1.default.info(`getById(): model fetched`, { id });
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
        logger_1.default.info(`updateById(): model updated`, { id });
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
        await schema_1.default.findByIdAndDelete(id);
        if (!id) {
            throw new AppError_1.AppError('Not found', `Failed to delete ${model}`, 404);
        }
        logger_1.default.info(`deleteById(): ${model} deleted`, { id });
        return true;
    }
    catch (error) {
        logger_1.default.error(`deleteById(): Failed to delete ${model}`, error);
        throw error;
    }
};
exports.deleteById = deleteById;
const getEnrolledCoursesService = async (userId) => {
    if (!userId) {
        throw new AppError_1.AppError('Authentication Error', 'User not logged in', 401);
    }
    try {
        // Find the user by ID and populate enrolled courses
        const user = await schema_1.default.findById(userId)
            .populate({
            path: 'enrolledCourses.courseId',
            select: 'title' // Fetch the title field from the Course model
        })
            .lean();
        if (!user) {
            throw new AppError_1.AppError('NotFoundError', 'User not found', 404);
        }
        // Check if the user has enrolled courses
        if (!user.enrolledCourses || user.enrolledCourses.length === 0) {
            throw new AppError_1.AppError('NoEnrolledCourses', 'The user has no enrolled courses', 404);
        }
        // Map the enrolledCourses to the desired format
        const courses = user.enrolledCourses
            .map((course) => {
            if (!course.courseId)
                return null; // Skip if courseId is not populated
            return {
                courseId: course.courseId._id, // Assuming 'courseId' is the MongoDB ObjectId
                title: course.courseId.title,
                enrolledAt: course.enrolledAt.toISOString() // Convert Date to ISO string
            };
        })
            .filter(Boolean); // Remove any null entries
        return courses;
    }
    catch (error) {
        logger_1.default.error(`getEnrolledCoursesService(): Failed to fetch enrolled courses`, error);
        throw error;
    }
};
exports.getEnrolledCoursesService = getEnrolledCoursesService;
const getUserStatisticsAndCourses = async (userId) => {
    if (!userId) {
        throw new AppError_1.AppError('AuthenticationError', 'User not logged in', 401);
    }
    try {
        // Fetch the user with populated enrolled courses
        const user = await schema_1.default.findById(userId)
            .populate({
            path: 'enrolledCourses.courseId',
            select: 'title modules'
        })
            .lean();
        if (!user) {
            throw new AppError_1.AppError('NotFoundError', 'User not found', 404);
        }
        // Check if user has enrolled courses
        if (!user.enrolledCourses || user.enrolledCourses.length === 0) {
            return {
                statistics: {
                    totalEnrolledCourses: 0,
                    averageCourseProgress: 0
                },
                courses: []
            };
        }
        // Process enrolled courses data
        const courses = user?.enrolledCourses?.map((course) => {
            const totalLessons = course.courseId.modules?.length || 0;
            const completedLessons = course.completedModules?.length || 0;
            return {
                _id: course.courseId._id,
                title: course.courseId.title,
                progress: course.progress,
                totalLessons,
                completedLessons
            };
        });
        // Calculate statistics
        const totalEnrolledCourses = courses.length;
        const totalProgress = courses.reduce((sum, course) => sum + course.progress, 0);
        const averageCourseProgress = totalEnrolledCourses > 0 ? totalProgress / totalEnrolledCourses : 0;
        return {
            statistics: {
                totalEnrolledCourses,
                averageCourseProgress
            },
            courses
        };
    }
    catch (error) {
        logger_1.default.error(`getUserStatisticsAndCourses(): Failed to fetch data for user ${userId}`, error);
        throw error;
    }
};
exports.getUserStatisticsAndCourses = getUserStatisticsAndCourses;
// get all the stats
const getAdminDashboardStats = async () => {
    const totalUsers = await schema_2.default.countDocuments();
    const activeUsers = await schema_2.default.countDocuments({ isDeactivated: false });
    const totalAdmins = await schema_2.default.countDocuments({ isAdmin: true });
    const totalCourses = await schema_3.default.countDocuments();
    const publishedCourses = await schema_3.default.countDocuments({ isPublished: true });
    const totalEnrolledStudents = await schema_3.default.aggregate([
        { $group: { _id: null, total: { $sum: '$enrolledStudents' } } }
    ]);
    const totalVideos = await schema_4.default.countDocuments();
    const watchedVideos = await schema_4.default.countDocuments({
        watchedBy: { $exists: true, $ne: [] }
    });
    const totalModules = await schema_5.default.countDocuments();
    const enrollmentTrends = await schema_2.default.aggregate([
        { $unwind: '$enrolledCourses' },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: '%Y-%m-%d',
                        date: '$enrolledCourses.enrolledAt'
                    }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);
    const authStats = await schema_2.default.aggregate([
        { $group: { _id: '$authType', count: { $sum: 1 } } }
    ]);
    const totalVideoDuration = await schema_4.default.aggregate([
        { $group: { _id: null, totalDuration: { $sum: '$duration' } } }
    ]);
    const averageProgress = await schema_2.default.aggregate([
        { $unwind: '$enrolledCourses' },
        {
            $lookup: {
                from: 'courses', // Assuming the courses collection is named 'courses'
                localField: 'enrolledCourses.courseId',
                foreignField: '_id',
                as: 'courseDetails'
            }
        },
        { $unwind: '$courseDetails' }, // Unwind to flatten the array of courseDetails
        {
            $group: {
                _id: '$courseDetails._id', // Group by the course's _id
                title: { $first: '$courseDetails.title' }, // Get the title of the course
                avgProgress: { $avg: '$enrolledCourses.progress' } // Calculate the average progress
            }
        }
    ]);
    const mostPopularCourse = await schema_3.default.findOne()
        .sort({ enrolledStudents: -1 })
        .limit(1);
    const inactiveUsers = await schema_2.default.countDocuments({
        enrolledCourses: { $size: 0 }
    });
    return {
        totalUsers,
        activeUsers,
        totalAdmins,
        totalCourses,
        publishedCourses,
        totalVideos,
        watchedVideos,
        totalModules,
        mostPopularCourse,
        totalEnrolledStudents,
        enrollmentTrends,
        authStats,
        totalVideoDuration,
        averageProgress,
        inactiveUsers
    };
};
exports.getAdminDashboardStats = getAdminDashboardStats;
//# sourceMappingURL=service.js.map