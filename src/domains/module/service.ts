import logger from '../../libraries/log/logger';
import Model from './schema';
import { AppError } from '../../libraries/error-handling/AppError';
import Course, { ICourse } from '../course/schema';
import Video from '../video/schema';

const model: string = 'Module';

interface IData {
  [key: string]: string | number | any;
}

const create = async (data: IData): Promise<any> => {
  try {
    const { course } = data;
    if (!course) {
      throw new AppError('Course is required', 'Course is required', 400);
    }
    const existingCourse: ICourse | null = await Course.findById(course);
    if (!existingCourse) {
      throw new AppError('Course not found', 'Course not found', 404);
    }

    const module = new Model(data);
    const savedModule = await module.save();
    if (!existingCourse.modules) {
      existingCourse.modules = [];
    }
    existingCourse.modules.push(module._id as any);
    await existingCourse.save();

    logger.info(`create(): ${model} created`, {
      id: savedModule._id
    });
    return savedModule;
  } catch (error: any) {
    logger.error(`create(): Failed to create ${model}`, error);
    throw new AppError(`Failed to create ${model}`, error.message);
  }
};

interface SearchQuery {
  keyword?: string;
  courseId?: string;
  videoId?: string;
}

const search = async (query: SearchQuery): Promise<any[]> => {
  try {
    const { keyword, courseId, videoId } = query ?? {};
    const filter: any = {};

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
    const items = await Model.find(filter).populate({
      path: 'videos',
      select: `_id title duration ${videoId === 'true' ? 'videoId watchedBy' : ''}`
    });
    logger.info('search(): filter and count', {
      filter,
      count: items.length
    });
    if (!items) {
      throw new AppError('Not found', `Failed to search ${model}`, 404);
    }
    return items;
  } catch (error: any) {
    logger.error(`search(): Failed to search ${model}`, error);
    throw error;
  }
};

const getById = async (id: string): Promise<any> => {
  try {
    const item = await Model.findById(id);
    logger.info(`getById(): model fetched`, { id });
    if (!item) {
      throw new AppError('Not found', `Failed to get ${model}`, 404);
    }
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
    const item = await Model.findByIdAndDelete(id);
    if (!item) {
      throw new AppError('Not found', `Failed to delete ${model}`, 404);
    }

    await Course.findByIdAndUpdate(item.course, {
      $pull: { modules: item._id }
    });
    await Video.deleteMany({ module: item._id });
    logger.info(`deleteById(): ${model} deleted`, { id });
    return true;
  } catch (error: any) {
    logger.error(`deleteById(): Failed to delete ${model}`, error);
    throw error;
  }
};

export { create, search, getById, updateById, deleteById };
