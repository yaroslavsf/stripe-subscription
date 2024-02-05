import * as Joi from 'joi';
import { EConfigEnvironment } from 'src/common/enums';

export const configSchemaValidation: Joi.ObjectSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid(...Object.values(EConfigEnvironment))
    .default(EConfigEnvironment.production),
  PORT: Joi.number().required(),
  SWAGGER_USR: Joi.string().optional(),
  API_DOC_PATH: Joi.string().required(),
  SWAGGER_PASSWORD: Joi.string().optional(),
  STRIPE_SECRET_KEY: Joi.string().required(),
  FRONTEND_URL: Joi.string().required(),
  HARDCODED_CONTEXT_EMAIL: Joi.string().required(),
});
