import { Request, Response, NextFunction } from 'express';
import logger from '../../libraries/log/logger';

// Authentication Middleware
export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Passport's built-in method attached to the request object
  if (req.isAuthenticated()) {
    return next(); // User is authenticated, proceed
  } else {
    logger.warn('User is not authenticated');
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
