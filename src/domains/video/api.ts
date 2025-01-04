import express, { Request, Response, NextFunction } from 'express';
import logger from '../../libraries/log/logger';
import { AppError } from '../../libraries/error-handling/AppError';

import {
  create,
  search,
  getById,
  updateById,
  deleteById,
  markVideoAsWatched
} from './service';

import { createSchema, updateSchema, idSchema } from './request';
import { validateRequest } from '../../middlewares/request-validate';
import { logRequest } from '../../middlewares/log';
import { isAuthenticated } from '../../middlewares/auth/authentication';
import { isAuthorized } from '../../middlewares/auth/authorization';

const model: string = 'Video';

// CRUD for entity
const routes = (): express.Router => {
  const router = express.Router();
  logger.info(`Setting up routes for ${model}`);

  router.get(
    '/',
    logRequest({}),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const items = await search(req.query);
        res.json(items);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    '/',
    logRequest({}),
    isAuthenticated,
    isAuthorized,
    validateRequest({ schema: createSchema }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const item = await create(req.body);
        res.status(201).json(item);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    '/:id',
    logRequest({}),
    validateRequest({ schema: idSchema, isParam: true }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const item = await getById(req.params.id);
        if (!item) {
          throw new AppError(`${model} not found`, `${model} not found`, 404);
        }
        res.status(200).json(item);
      } catch (error) {
        next(error);
      }
    }
  );

  router.put(
    '/:id',
    logRequest({}),
    isAuthenticated,
    isAuthorized,
    validateRequest({ schema: idSchema, isParam: true }),
    validateRequest({ schema: updateSchema }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const item = await updateById(req.params.id, req.body);
        if (!item) {
          throw new AppError(`${model} not found`, `${model} not found`, 404);
        }
        res.status(200).json(item);
      } catch (error) {
        next(error);
      }
    }
  );
  router.put(
    '/:id/watched',
    logRequest({}),
    isAuthenticated,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.user?._id || '';
        const videoId = req.params.id;
        const item = await markVideoAsWatched(userId, videoId);
        console.log('watched', item);

        if (!item) {
          throw new AppError(`${model} not found`, `${model} not found`, 404);
        }
        res.status(200).json(item);
      } catch (error) {
        next(error);
      }
    }
  );

  router.delete(
    '/:id',
    logRequest({}),
    isAuthenticated,
    isAuthorized,
    validateRequest({ schema: idSchema, isParam: true }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await deleteById(req.params.id);
        res.status(204).json({ message: `${model} is deleted` });
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
};

export { routes };
