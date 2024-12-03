import productRoutes from './product';
import userRoutes from './user';
import { Router } from 'express';

const defineRoutes = async (expressRouter: Router): Promise<void> => {
  productRoutes(expressRouter);
  userRoutes(expressRouter);
};

export default defineRoutes;
