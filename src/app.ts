import express, { Application, Request, Response } from 'express';
import logger from './libraries/log/logger';
import domainRoutes from './domains/index';
import packageJson from '../package.json';

function formatUptime(uptime: number): string {
  const days = Math.floor(uptime / (24 * 60 * 60));
  const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((uptime % (60 * 60)) / 60);
  const seconds = Math.floor(uptime % 60);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

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
    const healthCheck = {
      uptime: process.uptime(),
      formattedUptime: formatUptime(process.uptime()),
      message: 'OK',
      timestamp: Date.now(),
      version: packageJson.version
    };
    res.status(200).json(healthCheck);
  });

  // 404 handler
  expressApp.use((req: Request, res: Response) => {
    res.status(404).send('Not Found');
  });

  logger.info('Routes defined');
}

export default defineRoutes;
