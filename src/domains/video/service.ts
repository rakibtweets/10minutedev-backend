import logger from '../../libraries/log/logger';
import Model from './schema';
import { AppError } from '../../libraries/error-handling/AppError';
import Module, { IModule } from '../module/schema';

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
    logger.info('search(): filter and count', {
      filter,
      count: items.length
    });
    return items;
  } catch (error: any) {
    logger.error(`search(): Failed to search ${model} `, error);
    throw new AppError(`Failed to search ${model} `, error.message, 400);
  }
};

const getById = async (id: string): Promise<any> => {
  try {
    const item = await Model.findById(id);
    logger.info(`getById(): model fetched`, { id });
    return item;
  } catch (error: any) {
    logger.error(`getById(): Failed to get ${model} `, error);
    throw new AppError(`Failed to get ${model} `, error.message);
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

    logger.info(`updateById(): model updated`, { id });
    return updatedItem;
  } catch (error: any) {
    logger.error(`updateById(): Failed to update ${model} `, error);
    throw new AppError(`Failed to update ${model} `, error.message);
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
    logger.info(`deleteById(): ${model}  deleted`, { id });
    return true;
  } catch (error: any) {
    logger.error(`deleteById(): Failed to delete ${model} `, error);
    throw new AppError(`Failed to delete ${model} `, error.message);
  }
};

export { create, search, getById, updateById, deleteById };
