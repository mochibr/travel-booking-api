const { HTTP_STATUS } = require('../constants/http.constants');

/**
 * Success response formatter
 */
class ApiResponse {
    static success(res, message, data = null, statusCode = HTTP_STATUS.OK) {
        const response = {
            success: true,
            message,
            ...(data && { data }),
        };
        return res.status(statusCode).json(response);
    }

    static error(res, message, errors = null, statusCode = HTTP_STATUS.BAD_REQUEST) {
        const response = {
            success: false,
            message,
            ...(errors && { errors }),
        };
        return res.status(statusCode).json(response);
    }

    static created(res, message, data = null) {
        return this.success(res, message, data, HTTP_STATUS.CREATED);
    }

    static unauthorized(res, message = 'Unauthorized access') {
        return this.error(res, message, null, HTTP_STATUS.UNAUTHORIZED);
    }

    static notFound(res, message = 'Resource not found') {
        return this.error(res, message, null, HTTP_STATUS.NOT_FOUND);
    }

    static forbidden(res, message = 'Access forbidden') {
        return this.error(res, message, null, HTTP_STATUS.FORBIDDEN);
    }

    static validationError(res, errors, message = 'Validation failed') {
        return this.error(res, message, errors, HTTP_STATUS.UNPROCESSABLE_ENTITY);
    }

    static internalError(res, message = 'Internal server error') {
        return this.error(res, message, null, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
}

module.exports = ApiResponse;

