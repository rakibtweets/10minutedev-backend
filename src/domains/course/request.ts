import Joi from 'joi';
import mongoose from 'mongoose';

// const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
// const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const createSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  thumbnail: Joi.object({
    url: Joi.alternatives()
      .try(
        Joi.string().uri().messages({
          'string.uri': 'Must be a valid URL'
        }),
        Joi.object()

          .custom((file) => {
            // if (!file || !file.size || file.size > MAX_FILE_SIZE) {
            //   console.log(file);
            //   return helpers.error('file.size', {
            //     message: 'File size must be less than 4MB'
            //   });
            // }

            // if (!file.type || !ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            //   return helpers.error('file.type', {
            //     message: 'Only .jpg, .jpeg, and .png formats are supported'
            //   });
            // }

            return file;
          })
          .messages({
            'file.size': 'File size must be less than 4MB',
            'file.type': 'Only .jpg, .jpeg, and .png formats are supported',
            'object.base': 'File must be a valid file object'
          })
      )
      .required(),

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
    url: Joi.string().uri().required(),
    publicId: Joi.string().required()
  }).optional(),
  instructor: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }, 'ObjectId validation')
    .required(), // MongoDB ObjectId validation
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
  duration: Joi.number().integer().min(1).optional(), // Duration in minutes
  enrolledStudents: Joi.forbidden(), // Prevent updating enrolledStudents
  price: Joi.number().precision(2).min(0).optional(),
  level: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
  isPublished: Joi.boolean().optional()
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

export { createSchema, updateSchema, idSchema };
