import { Request, Response, NextFunction } from 'express';
import logger from '../../libraries/log/logger';
import { AppError } from '../../libraries/error-handling/AppError';

// Authentication Middleware
export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Passport's built-in method attached to the request object
  try {
    if (req.isAuthenticated()) {
      return next();
    } else {
      logger.warn('User is not authenticated');
      throw new AppError('Unauthenticated', 'User Not authenticated', 401);
    }
  } catch (error) {
    next(error);
  }
};
