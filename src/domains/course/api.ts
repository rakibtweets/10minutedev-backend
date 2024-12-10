import express, { Request, Response, NextFunction } from 'express';
import logger from '../../libraries/log/logger';
import { AppError } from '../../libraries/error-handling/AppError';

import { create, search, getById, updateById, deleteById } from './service';

import { createSchema, updateSchema, idSchema } from './request';
import { validateRequest } from '../../middlewares/request-validate';
import { logRequest } from '../../middlewares/log';
import { uploadToCloudinary } from '../../utils/coudinary';

const model: string = 'Course';

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
    logRequest({}), // Log only title, instructor, and level
    validateRequest({ schema: createSchema }),
    async (req: Request, res: Response, next: NextFunction) => {
      const { thumbnail } = req.body;

      try {
        //@ts-ignore
        const result = await uploadToCloudinary(
          req.body.thumbnail.url,
          'course'
        );
        thumbnail.url = result.secure_url;
        thumbnail.publicId = result.public_id;

        const item = await create(req.body);
        console.log('item', item);
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

  router.delete(
    '/:id',
    logRequest({}),
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
