import logger from '../log/logger';
import { inspect } from 'util';
import { AppError } from './AppError';
import { Server } from 'http';
import mongoose from 'mongoose';

let httpServerRef: Server | null;

const errorHandler = {
  listenToErrorEvents: (): void => {
    process.on('uncaughtException', async (error: unknown) => {
      await errorHandler.handleError(error);
    });

    process.on('unhandledRejection', async (reason: unknown) => {
      await errorHandler.handleError(reason);
    });

    process.on('SIGTERM', async () => {
      logger.error(
        'App received SIGTERM event, try to gracefully close the server'
      );
      await terminateHttpServerAndExit();
    });

    process.on('SIGINT', async () => {
      logger.error(
        'App received SIGINT event, try to gracefully close the server'
      );
      await terminateHttpServerAndExit();
    });
  },

  handleError: async (errorToHandle: unknown): Promise<any> => {
    try {
      const appError: AppError = normalizeError(errorToHandle);
      console.log('handleError:  appError:', { appError });
      logger.error(appError.message, appError);

      if (!appError.isTrusted) {
        await terminateHttpServerAndExit();
      }
      return appError;
    } catch (handlingError) {
      // No logger here since it might have failed
      process.stdout.write(
        'The error handler failed. Here are the handler failure and then the origin error that it tried to handle: '
      );
      process.stdout.write(JSON.stringify(handlingError));
      process.stdout.write(JSON.stringify(errorToHandle));
    }
  }
};

const terminateHttpServerAndExit = async (): Promise<void> => {
  // @ts-ignore
  if (httpServerRef) {
    await new Promise<void>((resolve) => httpServerRef.close(() => resolve())); // Graceful shutdown
  }
  process.exit();
};

const normalizeError = (errorToHandle: unknown): AppError => {
  if (errorToHandle instanceof AppError) {
    console.log('normalizeError  errorToHandle:', { errorToHandle });
    return errorToHandle;
  }
  if (errorToHandle instanceof Error) {
    const appError = new AppError(errorToHandle.name, errorToHandle.message);
    appError.stack = errorToHandle.stack;
    console.log('normalizeError  appError:', { appError });
    return appError;
  }

  const inputType = typeof errorToHandle;
  return new AppError(
    'general-error',
    `Error Handler received a non-error instance with type - ${inputType}, value - ${inspect(
      errorToHandle
    )}`
  );
};
const errorHandlerMiddleware = (errorHandler: any) => {
  let error = errorHandler;

  // Check if the error is an instance of an ApiError class which extends native Error class
  if (!(error instanceof AppError)) {
    // if not
    // create a new ApiError instance to keep the consistency

    // assign an appropriate status code
    const HTTPStatus =
      error.HTTPStatus || error instanceof mongoose.Error ? 400 : 500;

    // set a message from native Error instance or a custom one
    const message = error.message || 'Internal server error';
    error = new AppError(error.name, message, HTTPStatus);
  }

  // Now we are sure that the `error` variable will be an instance of ApiError class
  const response = {
    ...error,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}) // Error stack traces should be visible in development for debugging
  };

  logger.error(response.message, response);

  // Send error response
  return response;
};

export { errorHandler, errorHandlerMiddleware };
