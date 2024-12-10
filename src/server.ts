import config from './configs';
import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import passport, { Profile as PassportProfile } from 'passport';
import defineRoutes from './app';
import { errorHandler } from './libraries/error-handling';
import logger from './libraries/log/logger';
import { addRequestIdMiddleware } from './middlewares/request-context';
import { connectWithMongoDb } from './libraries/db';
import cors from 'cors';
import { clearAuthInfo, getGithubStrategy, getGoogleStrategy } from './auth';
import session from 'express-session';
import MongoStore from 'connect-mongo';

// Extend Express Request interface

declare module 'express-session' {
  interface SessionData {
    userId: string;
    sessionId: string;
  }
}

interface Profile extends PassportProfile {
  _id: string;
}

let connection: any;

const handleAuthCallback = (strategy: string) => {
  return [
    function (req: Request, res: Response, next: NextFunction) {
      passport.authenticate(
        strategy,
        {
          failureRedirect: `${config.CLIENT_HOST}/sign-in`
        },
        (err: Error, user: PassportProfile) => {
          if (err || !user) {
            console.log('Failed to authenticate user', err);
            logger.error('Failed to authenticate user', err);
            return res.redirect(
              `${config.CLIENT_HOST}/sign-in?error=${err?.message}`
            );
          }
          req.logIn(user as any, function (err) {
            if (err) {
              console.log('Failed to log in', err);
              return res.redirect(
                `${config.CLIENT_HOST}/sign-in?error=failed-to-authenticate`
              );
            }
            // @ts-ignore
            req.session.userId = user._id;
            req.session.sessionId = req.sessionID;
            req.session.save((err) => {
              if (err) {
                logger.error('Failed to save session', err);
              } else {
                logger.info('Session saved');
              }
            });

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
      // const userId = req?.user?._id.toString();
      const userCookieValue = JSON.stringify({
        userId: req.user?._id.toString(),
        isAdmin: req.user?.isAdmin
      });
      res.cookie('user', userCookieValue, {
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
  expressApp.use(express.json({ limit: '5mb' }));
  expressApp.use(bodyParser.json());
  expressApp.use(
    cors({
      origin: config.CLIENT_HOST, // Your frontend origin
      credentials: true
    })
  );

  // passport js
  passport.use(getGithubStrategy());
  passport.use(getGoogleStrategy());

  const sessionStore = MongoStore.create({ mongoUrl: config.MONGODB_URI });
  // Session middleware
  expressApp.use(
    session({
      secret: config.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      store: sessionStore
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

  // Add Google auth routes
  expressApp.get(
    '/api/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  // Replace the GitHub callback route with:
  expressApp.get('/api/auth/github/callback', ...handleAuthCallback('github'));

  // Replace the Google callback route with:
  expressApp.get('/api/auth/google/callback', ...handleAuthCallback('google'));

  // get current logged in user data from req.user object
  expressApp.get('/api/user', (req, res) => {
    if (!req.user) {
      return res.status(401).send('Unauthorized');
    }

    const user = req.user;
    console.log('expressApp.get  user:', user);
    res.json(user);
  });

  // Logout route
  expressApp.get(
    '/api/logout',
    async (req: Request, res: Response, next: NextFunction) => {
      const email = req.user?.email;
      const userId = req.user?._id;

      req.logout(async function (err) {
        // Passport.js logout function
        if (err) {
          logger.error('Failed to log out user', err);
          return next(err);
        }

        req.session.destroy(function (err) {
          // Handle potential errors during session destruction
          if (err) {
            logger.error('Failed to destroy session', err);
          } else {
            logger.info('Session destroyed');
          }
        });

        res.cookie('user', '', {
          expires: new Date(0), // Set expiry date to a time in the past
          httpOnly: true,
          secure: true, // Use secure in production (HTTPS)
          sameSite: 'lax' // Adjust depending on deployment
        });

        if (userId) await clearAuthInfo(userId);

        logger.info('User logged out', { email });
        res.redirect(`${config.CLIENT_HOST}/sign-in`);
      });
    }
  );

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
