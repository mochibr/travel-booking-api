const TokenBlacklist = require('../models/TokenBlacklist');
const { asyncHandler } = require('../utils/asyncHandler');
const { verifyToken } = require('../utils/jwt');
const ApiResponse = require('../utils/response.util');
const { RESPONSE_MESSAGES } = require('../constants/http.constants');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check if token exists in headers
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return ApiResponse.unauthorized(res, RESPONSE_MESSAGES.UNAUTHORIZED);
    }

    try {
        // Check if token is blacklisted
        const isBlacklisted = await TokenBlacklist.isBlacklisted(token);
        if (isBlacklisted) {
            return ApiResponse.unauthorized(res, RESPONSE_MESSAGES.TOKEN_BLACKLISTED);
        }

        // Verify token
        const decoded = verifyToken(token);
        req.user = { id: decoded.id };
        req.token = token;
        next();
    } catch (error) {
        return ApiResponse.unauthorized(res, RESPONSE_MESSAGES.TOKEN_INVALID);
    }
});

module.exports = { protect };

