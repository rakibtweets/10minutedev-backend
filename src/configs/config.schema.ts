import Joi from 'joi';

const schema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  MONGODB_URI: Joi.string().required(),
  RATE: Joi.number().min(0).required(),
  PORT: Joi.number().min(1000).default(4000),
  //  OAuth Secrets
  GITHUB_CLIENT_ID: Joi.string().required(),
  GITHUB_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  ENCRYPTION_KEY: Joi.string().required(),
  SESSION_SECRET: Joi.string().required(),
  // host should start with http:// or https://
  HOST: Joi.string()
    .pattern(/^(http:\/\/|https:\/\/)/)
    .required(),
  CLIENT_HOST: Joi.string()
    .pattern(/^(http:\/\/|https:\/\/)/)
    .required(),
  ADMIN_EMAILS: Joi.array().items(Joi.string()).required()
});

export default schema;
