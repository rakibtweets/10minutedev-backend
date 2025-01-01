import Joi from 'joi';
import mongoose from 'mongoose';

const createSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  videoId: Joi.string().required(),
  module: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.isValidObjectId(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .required(),
  course: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.isValidObjectId(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .required(),
  duration: Joi.number().min(0).required(),
  order: Joi.number().integer().min(0).required(),
  watchedBy: Joi.array()
    .items(
      Joi.string().custom((value, helpers) => {
        if (!mongoose.isValidObjectId(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      })
    )
    .optional()
});

const updateSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().allow('').optional(),
  videoId: Joi.string().optional(),
  module: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.isValidObjectId(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .optional(),
  course: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.isValidObjectId(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .optional(),
  duration: Joi.number().min(0).optional(),
  order: Joi.number().integer().min(0).optional(),
  watchedBy: Joi.array()
    .items(
      Joi.string().custom((value, helpers) => {
        if (!mongoose.isValidObjectId(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      })
    )
    .optional() // WatchedBy remains optional
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
