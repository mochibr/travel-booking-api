const Joi = require('joi');
require('dotenv').config();

// Environment variables schema validation
const envSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
    PORT: Joi.number().default(5000),
    
    // Database
    DB_HOST: Joi.string().required(),
    DB_USER: Joi.string().required(),
    DB_PASSWORD: Joi.string().allow('').required(),
    DB_NAME: Joi.string().required(),
    DB_PORT: Joi.number().default(3306),
    
    // JWT
    JWT_SECRET: Joi.string().min(32).required(),
    JWT_EXPIRE: Joi.string().default('7d'),
    JWT_REFRESH_SECRET: Joi.string().min(32).optional(),
    JWT_REFRESH_EXPIRE: Joi.string().default('30d'),
    
    // CORS
    CORS_ORIGIN: Joi.string().default('*'),
    
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: Joi.number().default(15 * 60 * 1000), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    
    database: {
        host: envVars.DB_HOST,
        user: envVars.DB_USER,
        password: envVars.DB_PASSWORD,
        name: envVars.DB_NAME,
        port: envVars.DB_PORT,
    },
    
    jwt: {
        secret: envVars.JWT_SECRET,
        expire: envVars.JWT_EXPIRE,
        refreshSecret: envVars.JWT_REFRESH_SECRET,
        refreshExpire: envVars.JWT_REFRESH_EXPIRE,
    },
    
    cors: {
        origin: envVars.CORS_ORIGIN,
    },
    
    rateLimit: {
        windowMs: envVars.RATE_LIMIT_WINDOW_MS,
        maxRequests: envVars.RATE_LIMIT_MAX_REQUESTS,
    },
};

