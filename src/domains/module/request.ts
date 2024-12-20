import Joi from 'joi';
import mongoose, { Types } from 'mongoose';

const createSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  course: Joi.string()
    .custom((value, helpers) => {
      if (!Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }, 'Object Id Validation')
    .required(),
  videos: Joi.array()
    .items(
      Joi.string().custom((value, helpers) => {
        if (!Types.ObjectId.isValid(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      }, 'Object Id Validation')
    )
    .optional(),
  order: Joi.number().optional(),
  duration: Joi.number().default(0)
});

const updateSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string(),
  course: Joi.string()
    .custom((value, helpers) => {
      if (!Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }, 'Object Id Validation')
    .required(),
  videos: Joi.array()
    .items(
      Joi.string().custom((value, helpers) => {
        if (!Types.ObjectId.isValid(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      }, 'Object Id Validation')
    )
    .optional(),
  order: Joi.number().optional()
}).min(1);

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
