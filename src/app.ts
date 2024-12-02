import express, { Application, Request, Response } from 'express';
import logger from './libraries/log/logger';
import domainRoutes from './domains/index';

function defineRoutes(expressApp: Application): void {
  logger.info('Defining routes...');
  const router = express.Router();

  domainRoutes(router);

  expressApp.use('/api/v1', router);

  // Default route
  expressApp.get('/', (req: Request, res: Response) => {
    console.log('Welcome to 10minutedev server');
    res.send('Welcome to 10minutedev server');
  });
  // Health check
  expressApp.get('/health', (req: Request, res: Response) => {
    res.send('OK');
  });

  // 404 handler
  expressApp.use((req: Request, res: Response) => {
    res.status(404).send('Not Found');
  });

  logger.info('Routes defined');
}

export default defineRoutes;
