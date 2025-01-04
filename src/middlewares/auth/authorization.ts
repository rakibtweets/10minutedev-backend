import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../libraries/error-handling/AppError';

// Authorization Middleware
export const isAuthorized = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user?.isAdmin) {
      next();
    } else {
      throw new AppError(
        'Unauthorized',
        'Access denied. You are not an admin.',
        403
      );
    }
  } catch (error) {
    next(error);
  }
};
