import logger from '../../libraries/log/logger';
import Model from './schema';
import { AppError } from '../../libraries/error-handling/AppError';

const model: string = 'User';

interface IData {
  [key: string]: any;
}

const create = async (data: IData): Promise<any> => {
  try {
    const item = new Model(data);
    const saved = await item.save();
    logger.info(`create(): ${model} created`, {
      id: saved._id
    });
    return saved;
  } catch (error: any) {
    logger.error(`create(): Failed to ${model} model`, error);
    throw new AppError(`Failed to create ${model}`, error.message);
  }
};

interface SearchQuery {
  keyword?: string;
}

const search = async (query: SearchQuery): Promise<any[]> => {
  try {
    const { keyword } = query ?? {};
    const filter: any = {};
    if (keyword) {
      filter.or = [
        { name: { regex: keyword, options: 'i' } },
        { description: { regex: keyword, options: 'i' } }
      ];
    }
    const items = await Model.find(filter);
    logger.info('search(): filter and count', {
      filter,
      count: items.length
    });
    return items;
  } catch (error: any) {
    logger.error(`search(): Failed to search ${model}`, error);
    throw new AppError(`Failed to search ${model}`, error.message, 400);
  }
};

const getByGitHubId = async (githubId: string) => {
  return await Model.findOne({ 'github.id': githubId });
};

// Add this new function
const getByGoogleId = async (googleId: string) => {
  return await Model.findOne({ 'google.id': googleId });
};

const getById = async (id: string): Promise<any> => {
  try {
    const item = await Model.findById(id);
    if (!item) {
      throw new AppError('Not found', `Failed to get ${model}`, 404);
    }
    logger.info(`getById(): model fetched`, { id });
    return item;
  } catch (error: any) {
    logger.error(`getById(): Failed to get ${model}`, error);
    throw error;
  }
};

const updateById = async (id: string, data: IData): Promise<any> => {
  try {
    const item = await Model.findByIdAndUpdate(id, data, { new: true });
    logger.info(`updateById(): model updated`, { id });
    if (!item) {
      throw new AppError('Not found', `Failed to update ${model}`, 404);
    }
    return item;
  } catch (error: any) {
    logger.error(`updateById(): Failed to update ${model}`, error);
    throw error;
  }
};

const deleteById = async (id: string): Promise<boolean> => {
  try {
    await Model.findByIdAndDelete(id);
    if (!id) {
      throw new AppError('Not found', `Failed to delete ${model}`, 404);
    }
    logger.info(`deleteById(): ${model} deleted`, { id });

    return true;
  } catch (error: any) {
    logger.error(`deleteById(): Failed to delete ${model}`, error);
    throw error;
  }
};
const getEnrolledCoursesService = async (
  userId: string | undefined
): Promise<any> => {
  if (!userId) {
    throw new AppError('Authentication Error', 'User not logged in', 401);
  }

  try {
    // Find the user by ID and populate enrolled courses
    const user = await Model.findById(userId)
      .populate({
        path: 'enrolledCourses.courseId',
        select: 'title' // Fetch the title field from the Course model
      })
      .lean();

    if (!user) {
      throw new AppError('NotFoundError', 'User not found', 404);
    }

    // Check if the user has enrolled courses
    if (!user.enrolledCourses || user.enrolledCourses.length === 0) {
      throw new AppError(
        'NoEnrolledCourses',
        'The user has no enrolled courses',
        404
      );
    }

    // Map the enrolledCourses to the desired format
    const courses = user.enrolledCourses
      .map((course: any) => {
        if (!course.courseId) return null; // Skip if courseId is not populated

        return {
          courseId: course.courseId._id, // Assuming 'courseId' is the MongoDB ObjectId
          title: course.courseId.title,
          enrolledAt: course.enrolledAt.toISOString() // Convert Date to ISO string
        };
      })
      .filter(Boolean); // Remove any null entries

    return courses;
  } catch (error: any) {
    logger.error(
      `getEnrolledCoursesService(): Failed to fetch enrolled courses`,
      error
    );
    throw error;
  }
};

const getUserStatisticsAndCourses = async (
  userId: string | undefined
): Promise<{
  statistics: {
    totalEnrolledCourses: number;
    averageCourseProgress: number;
  };
  courses: {
    _id: string;
    title: string;
    progress: number;
    totalLessons: number;
    completedLessons: number;
  }[];
}> => {
  if (!userId) {
    throw new AppError('AuthenticationError', 'User not logged in', 401);
  }

  try {
    // Fetch the user with populated enrolled courses
    const user = await Model.findById(userId)
      .populate({
        path: 'enrolledCourses.courseId',
        select: 'title modules'
      })
      .lean();

    if (!user) {
      throw new AppError('NotFoundError', 'User not found', 404);
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
    const courses = user?.enrolledCourses?.map((course: any) => {
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
    const totalProgress = courses.reduce(
      (sum, course) => sum + course.progress,
      0
    );
    const averageCourseProgress =
      totalEnrolledCourses > 0 ? totalProgress / totalEnrolledCourses : 0;

    return {
      statistics: {
        totalEnrolledCourses,
        averageCourseProgress
      },
      courses
    };
  } catch (error: any) {
    logger.error(
      `getUserStatisticsAndCourses(): Failed to fetch data for user ${userId}`,
      error
    );
    throw error;
  }
};

export {
  create,
  search,
  getById,
  updateById,
  deleteById,
  getByGitHubId,
  getByGoogleId,
  getEnrolledCoursesService,
  getUserStatisticsAndCourses
};
