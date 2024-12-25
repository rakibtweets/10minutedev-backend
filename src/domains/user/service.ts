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

export {
  create,
  search,
  getById,
  updateById,
  deleteById,
  getByGitHubId,
  getByGoogleId
};
