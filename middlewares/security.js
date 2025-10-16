const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const config = require('../config/env.config');

// Rate limiting configuration
const createRateLimiter = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            success: false,
            message: message || 'Too many requests, please try again later',
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
};

// General API rate limiter
const apiLimiter = createRateLimiter(
    config.rateLimit.windowMs,
    config.rateLimit.maxRequests,
    'Too many requests from this IP, please try again later'
);

// Strict rate limiter for authentication routes
const authLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    5, // 5 requests per window
    'Too many authentication attempts, please try again after 15 minutes'
);

// Helmet configuration for security headers
const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
});

module.exports = {
    apiLimiter,
    authLimiter,
    helmetConfig,
};

