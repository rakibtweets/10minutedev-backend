import Joi from 'joi';
import mongoose from 'mongoose';

// const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
// const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const createSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  thumbnail: Joi.object({
    url: Joi.string().required(),
    publicId: Joi.string().optional().allow('')
  }),
  instructor: Joi.string().min(3).max(100).required(), // MongoDB ObjectId validation
  modules: Joi.array()
    .items(
      Joi.string().custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error('any.invalid', { value });
        }
        return value;
      }, 'ObjectId validation')
    )
    .optional(),
  duration: Joi.alternatives()
    .try(
      Joi.number().positive().integer().messages({
        'number.base': 'Duration must be a number',
        'number.positive': 'Duration must be positive',
        'number.integer': 'Duration must be an integer'
      }),
      Joi.string()
    )
    .custom((value, helpers) => {
      const coercedValue = Number(value);
      if (isNaN(coercedValue)) {
        return helpers.error('any.invalid', {
          message: 'Duration must be a valid number'
        });
      }
      if (!Number.isInteger(coercedValue) || coercedValue <= 0) {
        return helpers.error('any.invalid', {
          message: 'Duration must be a positive integer'
        });
      }
      return coercedValue;
    })
    .messages({
      'alternatives.match':
        'Duration must be a positive integer or valid string'
    }), // Duration in minutes
  enrolledStudents: Joi.number().integer().min(0).default(0),
  price: Joi.number().precision(2).min(0).optional(),
  level: Joi.string().valid('beginner', 'intermediate', 'advanced').required(),
  tags: Joi.array().items(Joi.string().required()).min(1).messages({
    'array.min': 'Please at least one item',
    'string.base': 'Tags must be strings',
    'any.required': 'Tags are required'
  }),
  isPublished: Joi.boolean().default(false)
});

const updateSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  description: Joi.string().min(10).max(1000).optional(),
  thumbnail: Joi.object({
    url: Joi.string().optional(),
    publicId: Joi.string().optional().allow('')
  }).optional(),
  instructor: Joi.string().min(3).max(100).optional(), // MongoDB ObjectId validation
  modules: Joi.array()
    .items(
      Joi.string().custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error('any.invalid', { value });
        }
        return value;
      }, 'ObjectId validation')
    )
    .optional(),
  duration: Joi.alternatives()
    .try(
      Joi.number().positive().integer().messages({
        'number.base': 'Duration must be a number',
        'number.positive': 'Duration must be positive',
        'number.integer': 'Duration must be an integer'
      }),
      Joi.string()
    )
    .custom((value, helpers) => {
      const coercedValue = Number(value);
      if (isNaN(coercedValue)) {
        return helpers.error('any.invalid', {
          message: 'Duration must be a valid number'
        });
      }
      if (!Number.isInteger(coercedValue) || coercedValue <= 0) {
        return helpers.error('any.invalid', {
          message: 'Duration must be a positive integer'
        });
      }
      return coercedValue;
    })
    .optional()
    .messages({
      'alternatives.match':
        'Duration must be a positive integer or valid string'
    }), // Duration in minutes
  enrolledStudents: Joi.number().integer().min(0).optional(),
  price: Joi.number().precision(2).min(0).optional(),
  level: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
  tags: Joi.array().items(Joi.string().required()).min(1).optional().messages({
    'array.min': 'Please at least one item',
    'string.base': 'Tags must be strings',
    'any.required': 'Tags are required'
  }),
  isPublished: Joi.boolean().optional()
}).min(1);

const publishSchema = Joi.object({
  isPublished: Joi.boolean().required().messages({
    'any.required': "'isPublished' field is required.",
    'boolean.base': "'isPublished' must be a boolean value (true or false)."
  })
});

const idSchema = Joi.object().keys({
  id: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }, 'ObjectId validation')
    .required()
});

export { createSchema, updateSchema, idSchema, publishSchema };
