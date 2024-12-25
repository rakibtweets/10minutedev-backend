import validator from 'validator';
import { Request, Response, NextFunction } from 'express';
import logger from '../../libraries/log/logger';
import { ValidationError } from '../../libraries/error-handling/AppError';
import { ObjectSchema, ValidationResult } from 'joi';

interface ValidateRequestOptions {
  schema: ObjectSchema; // Joi schema
  isParam?: boolean;
  isQuery?: boolean;
}

function validateRequest({
  schema,
  isParam = false,
  isQuery = false
}: ValidateRequestOptions) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const input = isParam ? req.params : isQuery ? req.query : req.body;

    // Sanitize inputs
    for (const key in input) {
      if (typeof input[key] === 'string') {
        input[key] = validator.escape(input[key]);
      }
    }

    const validationResult: ValidationResult = schema.validate(input, {
      abortEarly: false
    });

    if (validationResult.error) {
      const messages = validationResult.error.details.map(
        (detail) => detail.message
      );

      logger.error(`${req.method} ${req.originalUrl} Validation failed`, {
        errors: messages
      });

      throw new ValidationError(messages.join(', ')); // Combine messages for clarity
    }

    // Attach validation result back to the original field
    if (isParam) {
      req.params = validationResult.value;
    } else if (isQuery) {
      req.query = validationResult.value;
    } else {
      req.body = validationResult.value;
    }

    // Validation successful - proceed
    next();
  };
}

export { validateRequest };
