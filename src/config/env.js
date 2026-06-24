const { z } = require('zod');

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.string().optional(),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  MONGO_DB_NAME: z.string().min(1).default('note-app-db'),
  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
  JWT_ACCESS_EXPIRES_IN: z.string().min(1).default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().min(1).default('30d'),
  COOKIE_SECURE: z.enum(['true', 'false']).default('true'),
  CORS_ALLOWED_ORIGINS: z.string().min(1, 'CORS_ALLOWED_ORIGINS is required'),
  API_BASE_URL: z.string().optional(),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
});

const validateEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');

    throw new Error(`Invalid environment configuration: ${message}`);
  }

  Object.assign(process.env, {
    MONGO_DB_NAME: result.data.MONGO_DB_NAME,
    JWT_ACCESS_EXPIRES_IN: result.data.JWT_ACCESS_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN: result.data.JWT_REFRESH_EXPIRES_IN,
    COOKIE_SECURE: result.data.COOKIE_SECURE,
    BCRYPT_SALT_ROUNDS: String(result.data.BCRYPT_SALT_ROUNDS),
  });

  return result.data;
};

module.exports = validateEnv;
