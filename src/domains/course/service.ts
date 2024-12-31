import logger from '../../libraries/log/logger';
import Model, { ICourse } from './schema';
import { AppError } from '../../libraries/error-handling/AppError';
import { deleteFromCloudinary } from '../../utils/coudinary';
import Module from '../module/schema';
import Video from '../video/schema';
import Course from './schema';
import User from '../user/schema';
import mongoose from 'mongoose';

const model: string = 'Course';

interface IData {
  [key: string]: any;
}

const create = async (data: ICourse): Promise<ICourse> => {
  try {
    const item = new Model(data);
    const saved = await item.save();
    logger.info(`create(): ${model} created`, {
      id: saved._id
    });
    return saved;
  } catch (error: any) {
    logger.error(`create(): Failed to create ${model}`, error);
    throw new AppError(`Failed to create ${model}`, error.message);
  }
};

interface SearchQuery {
  keyword?: string;
  tag?: string;
  isPublished?: string;
  limit?: number;
}

const search = async (query: SearchQuery): Promise<ICourse[]> => {
  try {
    const { keyword, tag, isPublished, limit } = query ?? {};
    const filter: any = {};
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
    let queryBuilder = Model.find(filter);
    if (limit) {
      queryBuilder = queryBuilder.limit(Number(limit));
    }
    const items = await queryBuilder;
    logger.info('search(): filter and count', {
      filter,
      count: items.length
    });
    return items;
  } catch (error: any) {
    logger.error(`search(): Failed to search ${model}`, error);
    throw error;
  }
};

const getById = async (id: string): Promise<any> => {
  try {
    const item = await Model.findById(id);
    logger.info(`getById(): ${model} fetched`, { id });
    return item;
  } catch (error: any) {
    logger.error(`getById(): Failed to get ${model}`, error);
    throw error;
  }
};

const updateById = async (id: string, data: IData): Promise<any> => {
  try {
    const item = await Model.findByIdAndUpdate(id, data, { new: true });
    logger.info(`updateById(): ${model} updated`, { id });
    return item;
  } catch (error: any) {
    logger.error(`updateById(): Failed to update ${model}`, error);
    throw error;
  }
};

const deleteById = async (id: string): Promise<boolean> => {
  try {
    const item = await Model.findByIdAndDelete(id);
    if (!item) {
      throw new AppError(`${model} not found`, `${model} not found`, 404);
    }
    if (item.thumbnail?.publicId) {
      await deleteFromCloudinary(item.thumbnail.publicId);
    }
    await Module.deleteMany({ course: item._id });
    await Video.deleteMany({ course: item._id });
    logger.info(`deleteById(): ${model} deleted`, { id });
    return true;
  } catch (error: any) {
    logger.error(`deleteById(): Failed to delete ${model}`, error);
    throw error;
  }
};
const enrollCourseService = async (
  courseId: string,
  userId: string,
  userEmail: string | undefined,
  bodyEmail: string
): Promise<any> => {
  try {
    if (!userId) {
      throw new AppError('Authentication error', 'User not logged in', 401);
    }
    //  Validate email
    if (bodyEmail !== userEmail) {
      throw new AppError(
        'Varification Error',
        'Email does not match the authenticated user',
        403
      );
    }

    //  Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('NotFoundError', 'Course not found', 404);
    }

    //  Find the user
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('NotFoundError', 'User not found', 404);
    }

    //  Check if the user is already enrolled
    if (
      user.enrolledCourses?.some(
        (enrolledCourse: any) => enrolledCourse.courseId.toString() === courseId
      )
    ) {
      throw new AppError(
        'BadRequestError',
        'User already enrolled in this course',
        400
      );
    }

    //Enroll the user
    user.enrolledCourses = user.enrolledCourses || [];
    user.enrolledCourses.push({
      courseId: course._id as mongoose.Types.ObjectId,
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
  } catch (error: any) {
    // Log the error for debugging purposes
    logger.error(`enrollCourseService(): Failed to enroll ${model}`, error);

    throw error;
  }
};

export { create, search, getById, updateById, deleteById, enrollCourseService };
