export const config = () => ({
  NODE_ENV: process.env.NODE_ENV,
  API_DOC_PATH: process.env.API_DOC_PATH,
  PORT: parseInt(process.env.PORT || '', 10),
  SWAGGER_USR: process.env.SWAGGER_USR,
  SWAGGER_PASSWORD: process.env.SWAGGER_PASSWORD,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  FRONTEND_URL: process.env.FRONTEND_URL,
  HARDCODED_CONTEXT_EMAIL: process.env.FRONTEND_URL,
});
