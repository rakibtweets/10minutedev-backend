import express, { Request, Response, NextFunction } from 'express';
import logger from '../../libraries/log/logger';
import { AppError } from '../../libraries/error-handling/AppError';
import {
  create,
  search,
  getById,
  updateById,
  deleteById,
  enrollCourseService
} from './service';
import {
  createSchema,
  updateSchema,
  idSchema,
  publishSchema,
  emailSchema
} from './request';
import { validateRequest } from '../../middlewares/request-validate';
import { logRequest } from '../../middlewares/log';
import {
  deleteFromCloudinary,
  uploadToCloudinary
} from '../../utils/coudinary';
import Model from './schema';
import { isAuthenticated } from '../../middlewares/auth/authentication';

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
      console.log('req query', req.query);
      try {
        const { thumbnail } = req.body;
        const course = await Model.findById(req.params.id);

        if (!course) {
          throw new AppError(`${model} not found`, `${model} not found`, 404);
        }

        if (thumbnail?.url && thumbnail?.url !== course?.thumbnail.url) {
          const result = await uploadToCloudinary(thumbnail.url, 'course');
          thumbnail.url = result.secure_url;
          thumbnail.publicId = result.public_id;
          console.log('new thumbnail');
          // delete the old thumbnail
          if (course?.thumbnail.publicId) {
            await deleteFromCloudinary(course?.thumbnail?.publicId);
            console.log('old thumbnail deleted');
          }
        } else {
          //@ts-ignore
          thumbnail.url = course?.thumbnail.url;
          //@ts-ignore
          thumbnail.public_id = course?.thumbnail.public_id;
          console.log('old thumbnail');
        }

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
    '/:id/publish',
    logRequest({}),
    validateRequest({ schema: idSchema, isParam: true }),
    validateRequest({ schema: publishSchema }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        const { isPublished } = req.body;

        // Validate that 'isPublished' exists and is a valid boolean
        if (isPublished === undefined) {
          throw new AppError(
            "'isPublished' field is required in the request body",
            'Validation Error',
            400
          );
        }

        const isValidBoolean = typeof isPublished === 'boolean';
        if (!isValidBoolean) {
          throw new AppError(
            "'isPublished' must be a boolean value (true or false)",
            'Validation Error',
            400
          );
        }

        // Update only the 'isPublished' property in the document
        const course = await Model.findByIdAndUpdate(
          id, // Course ID
          { isPublished },
          { new: true, runValidators: true } // Return updated document and run validators
        );

        if (!course) {
          throw new AppError(`${model} not found`, `${model} not found`, 404);
        }
        res.status(200).json(course);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    '/:id/enroll',
    logRequest({}),
    isAuthenticated,
    validateRequest({ schema: idSchema, isParam: true }),
    validateRequest({ schema: emailSchema }),
    async (req: Request, res: Response, next: NextFunction) => {
      const { id: courseId } = req.params;
      const { email } = req.body;
      const userId = req.user?._id || '';
      const userEmail = req.user?.email;

      try {
        // Call the service to handle the enrollment logic
        const enrolledCourse = await enrollCourseService(
          courseId,
          userId,
          userEmail,
          email
        );

        res.status(200).json(enrolledCourse);
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
