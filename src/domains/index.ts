import productRoutes from './product';
import userRoutes from './user';
import courseRoutes from './course';
import { Router } from 'express';

const defineRoutes = async (expressRouter: Router): Promise<void> => {
  productRoutes(expressRouter);
  userRoutes(expressRouter);
  courseRoutes(expressRouter);
};

export default defineRoutes;
