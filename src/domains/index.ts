import productRoutes from './product';
import userRoutes from './user';
import courseRoutes from './course';
import moduleRoutes from './module';
import videoRoutes from './video';
import { Router } from 'express';

const defineRoutes = async (expressRouter: Router): Promise<void> => {
  productRoutes(expressRouter);
  userRoutes(expressRouter);
  courseRoutes(expressRouter);
  moduleRoutes(expressRouter);
  videoRoutes(expressRouter);
};

export default defineRoutes;
