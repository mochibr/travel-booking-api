const logger = require('../config/logger.config');
const config = require('../config/env.config');
const ApiResponse = require('../utils/response.util');
const { HTTP_STATUS, RESPONSE_MESSAGES } = require('../constants/http.constants');

// Global error handler
const errorHandler = (err, req, res, next) => {
    logger.error(`Error: ${err.message}`);
    
    // Log stack trace in development
    if (config.env === 'development') {
        logger.error(err.stack);
    }

    // Duplicate key error (MySQL)
    if (err.code === 'ER_DUP_ENTRY') {
        return ApiResponse.error(
            res,
            RESPONSE_MESSAGES.USER_EXISTS,
            null,
            HTTP_STATUS.CONFLICT
        );
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return ApiResponse.unauthorized(res, RESPONSE_MESSAGES.TOKEN_INVALID);
    }

    if (err.name === 'TokenExpiredError') {
        return ApiResponse.unauthorized(res, RESPONSE_MESSAGES.TOKEN_INVALID);
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return ApiResponse.validationError(res, err.details);
    }

    // Default error
    const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = err.message || RESPONSE_MESSAGES.INTERNAL_ERROR;
    
    return ApiResponse.error(
        res,
        message,
        config.env === 'development' ? { stack: err.stack } : null,
        statusCode
    );
};

module.exports = errorHandler;

