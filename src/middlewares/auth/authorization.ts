import { Request, Response, NextFunction } from 'express';

// Authorization Middleware
export const isAuthorized = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.isAdmin) {
    next();
  } else {
    res.status(403).json({
      message: 'Access denied. You are not an admin.'
    });
  }
};
