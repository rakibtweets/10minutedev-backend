import logger from '../../libraries/log/logger';
import Model from './schema';
import { AppError } from '../../libraries/error-handling/AppError';
import Module, { IModule } from '../module/schema';
import Course from '../course/schema';
import User from '../user/schema';
import Video from './schema';

const model: string = 'Video';

interface IData {
  [key: string]: any;
}

const create = async (data: IData): Promise<any> => {
  try {
    const { module } = data;
    if (!module) {
      throw new AppError('Module is required', 'Module is required', 400);
    }
    const exsistingModule: IModule | null = await Module.findById(module);
    if (!exsistingModule) {
      throw new AppError('Course not found', 'Course not found', 404);
    }
    const video = new Model(data);
    const savedVideo = await video.save();
    if (!exsistingModule.videos) {
      exsistingModule.videos = [];
    }
    exsistingModule.videos.push(video._id as any);
    exsistingModule.duration += video.duration;
    await exsistingModule.save();

    await Course.findByIdAndUpdate(video.course, {
      $inc: { noOfVideos: 1, duration: video.duration }
    });

    logger.info(`create(): ${model} created`, {
      id: savedVideo._id
    });
    return savedVideo;
  } catch (error: any) {
    logger.error(`create(): Failed to create ${model} `, error);
    throw new AppError(`Failed to create ${model} `, error.message);
  }
};

interface SearchQuery {
  keyword?: string;
  moduleId?: string;
}

const search = async (query: SearchQuery): Promise<any[]> => {
  try {
    const { keyword, moduleId } = query ?? {};

    const filter: any = {};
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
    const items = await Model.find(filter);

    if (!items) {
      throw new AppError('Not found', `Failed to search ${model} `, 404);
    }

    logger.info('search(): filter and count', {
      filter,
      count: items.length
    });
    return items;
  } catch (error: any) {
    logger.error(`search(): Failed to search ${model} `, error);
    throw error;
  }
};

const getById = async (id: string): Promise<any> => {
  try {
    const item = await Model.findById(id);
    if (!item) {
      throw new AppError('Not found', `Failed to get ${model} `, 404);
    }
    logger.info(`getById(): model fetched`, { id });
    return item;
  } catch (error: any) {
    logger.error(`getById(): Failed to get ${model} `, error);
    throw error;
  }
};

const updateById = async (id: string, data: IData): Promise<any> => {
  try {
    const { duration } = data;

    const originalItem = await Model.findById(id);
    if (!originalItem) {
      throw new AppError(`${model} not found`, `${model} not found`, 404);
    }

    const durationDifference = duration - originalItem.duration;

    const updatedItem = await Model.findByIdAndUpdate(id, data, { new: true });

    if (!updatedItem) {
      throw new AppError(
        `${model} not found after update`,
        `${model} not found after update`,
        404
      );
    }

    // Update the associated module's duration
    await Module.findByIdAndUpdate(originalItem.module, {
      $inc: { duration: durationDifference }
    });
    await Course.findByIdAndUpdate(originalItem.course, {
      $inc: { duration: durationDifference }
    });

    logger.info(`updateById(): model updated`, { id });
    return updatedItem;
  } catch (error: any) {
    logger.error(`updateById(): Failed to update ${model} `, error);
    throw error;
  }
};

const deleteById = async (id: string): Promise<boolean> => {
  try {
    const item = await Model.findByIdAndDelete(id);
    if (!item) {
      throw new AppError(`${model} not found`, `${model} not found`, 404);
    }
    await Module.findByIdAndUpdate(item.module, {
      $pull: { videos: item._id },
      $inc: { duration: -item.duration }
    });
    await Course.findByIdAndUpdate(item.course, {
      $inc: { noOfVideos: -1, duration: -item.duration }
    });
    logger.info(`deleteById(): ${model}  deleted`, { id });
    return true;
  } catch (error: any) {
    logger.error(`deleteById(): Failed to delete ${model} `, error);
    throw error;
  }
};

const markVideoAsWatched = async (userId: string, videoId: string) => {
  try {
    // Mark video as watched
    const updatedItem = await Model.findOneAndUpdate(
      { videoId },
      {
        $addToSet: { watchedBy: userId }
      }
    );

    const video = await Video.findById(updatedItem?._id);
    if (!video) {
      throw new AppError('Video not found', 'Video not found', 404);
    }

    // Update user's watched videos
    await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { 'enrolledCourses.$[course].watchedVideos': video._id }
      },
      {
        arrayFilters: [{ 'course.courseId': video.course }]
      }
    );

    // Check if module is completed
    const module = await Module.findById(video.module);
    if (!module) {
      throw new AppError('Module not found', 'Module not found', 404);
    }
    const allVideosInModule = await Video.find({ module: video.module });

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 'User not found', 404);
    }
    const courseEnrollment = user?.enrolledCourses?.find(
      (c) => c.courseId.toString() === video.course.toString()
    );

    const allVideosWatched = allVideosInModule.every((v) =>
      courseEnrollment?.watchedVideos.includes(v._id)
    );

    if (allVideosWatched) {
      await User.findByIdAndUpdate(
        userId,
        {
          $addToSet: {
            'enrolledCourses.$[course].completedModules': module._id
          }
        },
        {
          arrayFilters: [{ 'course.courseId': video.course }]
        }
      );
    }

    return updatedItem;
  } catch (error) {
    logger.error(`markVideoAsWatched(): Failed to delete ${model} `, error);
    throw error;
  }
};

export { create, search, getById, updateById, deleteById, markVideoAsWatched };
