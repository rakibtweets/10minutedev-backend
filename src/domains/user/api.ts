import express, { Request, Response, NextFunction } from 'express';
import logger from '../../libraries/log/logger';
import { AppError } from '../../libraries/error-handling/AppError';
import {
  create,
  search,
  getById,
  updateById,
  deleteById,
  getEnrolledCoursesService,
  getUserStatisticsAndCourses,
  getAdminDashboardStats
} from './service';
import { createSchema, updateSchema, idSchema } from './request';
import { validateRequest } from '../../middlewares/request-validate';
import { logRequest } from '../../middlewares/log';
import { isAuthenticated } from '../../middlewares/auth/authentication';
import { isAuthorized } from '../../middlewares/auth/authorization';

const model: string = 'User';

// CRUD for entity
const routes = (): express.Router => {
  const router = express.Router();
  logger.info(`Setting up routes for model`);

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

  // create loggin in user enrolled courses
  router.get(
    '/enrolled-courses',
    logRequest({}),
    isAuthenticated,
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?._id || '';
      try {
        const enrolledCourses = await getEnrolledCoursesService(userId);
        res.status(200).json(enrolledCourses);
      } catch (error) {
        next(error);
      }
    }
  );
  router.get(
    '/admin-stats',
    logRequest({}),
    isAuthenticated,
    isAuthorized,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const stats = await getAdminDashboardStats();
        res.status(200).json(stats);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    '/dashboard',
    logRequest({}),
    isAuthenticated,
    isAuthorized,
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?._id || '';
      try {
        const enrolledCourses = await getUserStatisticsAndCourses(userId);
        res.status(200).json(enrolledCourses);
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
    isAuthenticated,
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
