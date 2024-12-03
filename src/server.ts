import config from './configs';
import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import passport, { Profile } from 'passport';
import defineRoutes from './app';
import { errorHandler } from './libraries/error-handling';
import logger from './libraries/log/logger';
import { addRequestIdMiddleware } from './middlewares/request-context';
import { connectWithMongoDb } from './libraries/db';
import cors from 'cors';
import { getGithubStrategy } from './auth';
import session from 'express-session';

let connection: any;

const handleAuthCallback = (strategy: string) => {
  return [
    function (req: Request, res: Response, next: NextFunction) {
      passport.authenticate(
        strategy,
        {
          failureRedirect: `${config.CLIENT_HOST}/sign-in`
        },
        (err: Error, user: Profile) => {
          if (err || !user) {
            console.log('Failed to authenticate user', err);
            logger.error('Failed to authenticate user', err);
            return res.redirect(
              `${config.CLIENT_HOST}/sign-in?error=${err?.message}`
            );
          }
          req.logIn(user, function (err) {
            if (err) {
              console.log('Failed to log in', err);
              return res.redirect(
                `${config.CLIENT_HOST}/sign-in?error=failed-to-authenticate`
              );
            }

            // req.session.userId = user._id;
            // req.session.sessionId = req.sessionID;
            // req.session.save((err) => {
            //   if (err) {
            //     logger.error('Failed to save session', err);
            //   } else {
            //     logger.info('Session saved');
            //   }
            // });

            next();
          });
        }
      )(req, res, next);
    },
    function (req: Request, res: Response) {
      if (strategy === 'github') {
        logger.info('/api/auth/github/callback', {
          //@ts-ignore
          username: req?.user?.username as Profile['username']
        });
      }
      //@ts-ignore
      const userId = req?.user?._id.toString();
      res.cookie('userId', userId, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
      });
      res.redirect(`${config.CLIENT_HOST}/login-success`);
    }
  ];
};

const createExpressApp = (): Application => {
  const expressApp = express();
  // Use middlewares
  expressApp.use(addRequestIdMiddleware);
  expressApp.use(helmet());
  expressApp.use(express.urlencoded({ extended: true }));
  expressApp.use(express.json());
  expressApp.use(
    cors({
      origin: config.CLIENT_HOST, // Your frontend origin
      credentials: true
    })
  );

  // passport js
  passport.use(getGithubStrategy());

  // Session middleware
  expressApp.use(
    session({
      secret: config.SESSION_SECRET,
      resave: false,
      saveUninitialized: true
    })
  );

  expressApp.use(passport.initialize());
  expressApp.use(passport.session());

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user: any, done) {
    done(null, user);
  });

  // Middleware to log an info message for each incoming request
  expressApp.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.originalUrl}`);
    next();
  });

  logger.info('Express middlewares are set up');

  // Authentication Routes
  // Github authentication
  expressApp.get('/api/auth/github', passport.authenticate('github'));

  // Replace the GitHub callback route with:
  expressApp.get('/api/auth/github/callback', ...handleAuthCallback('github'));

  // Define routes
  defineRoutes(expressApp);

  // Error handling middleware
  defineErrorHandlingMiddleware(expressApp);

  return expressApp;
};

const startWebServer = async (): Promise<Application> => {
  logger.info('Starting web server...');

  // Create Express application
  const expressApp = createExpressApp();

  // Open connection (assuming openConnection returns an object with address and port)
  const APIAddress = await openConnection(expressApp);

  // Log server info
  logger.info(`Server is running on ${APIAddress.address}:${APIAddress.port}`);

  // Connect to MongoDB
  await connectWithMongoDb();

  return expressApp;
};

const stopWebServer = async (): Promise<void> => {
  return new Promise<void>((resolve) => {
    if (connection !== undefined) {
      connection.close(() => {
        resolve();
      });
    }
  });
};

const openConnection = async (
  expressApp: Application
): Promise<{ address: string | null; port: number }> => {
  return new Promise<{ address: string | null; port: number }>((resolve) => {
    const webServerPort = config.PORT;
    logger.info(`Server is about to listen to port ${webServerPort}`);

    connection = expressApp.listen(webServerPort, () => {
      //@ts-ignore
      errorHandler.listenToErrorEvents(connection);
      const addressInfo = connection.address();
      if (typeof addressInfo === 'string') {
        resolve({ address: addressInfo, port: webServerPort });
      } else if (addressInfo && 'port' in addressInfo) {
        resolve({ address: addressInfo.address, port: addressInfo.port });
      } else {
        resolve({ address: null, port: webServerPort });
      }
    });
  });
};

const defineErrorHandlingMiddleware = (expressApp: Application): void => {
  expressApp.use(async (error: any, req: Request, res: Response) => {
    // Ensure next is included for Express error handlers
    if (error && typeof error === 'object') {
      if (error.isTrusted === undefined || error.isTrusted === null) {
        error.isTrusted = true;
      }
    }

    // Handle error and send response
    errorHandler.handleError(error);
    res.status(error?.HTTPStatus || 500).end();
  });
};

export { createExpressApp, startWebServer, stopWebServer };
