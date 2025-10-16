const AuthService = require('../services/auth.service');
const { asyncHandler } = require('../utils/asyncHandler');
const ApiResponse = require('../utils/response.util');
const { RESPONSE_MESSAGES, HTTP_STATUS } = require('../constants/http.constants');

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
    const result = await AuthService.registerUser(req.body);

    if (!result.success) {
        return ApiResponse.error(res, result.message, null, HTTP_STATUS.CONFLICT);
    }

    return ApiResponse.created(
        res,
        RESPONSE_MESSAGES.USER_REGISTERED,
        result.data
    );
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await AuthService.loginUser(email, password);

    if (!result.success) {
        return ApiResponse.unauthorized(res, result.message);
    }

    return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.LOGIN_SUCCESS,
        result.data
    );
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
    await AuthService.logoutUser(req.token);
    return ApiResponse.success(res, RESPONSE_MESSAGES.LOGOUT_SUCCESS);
});

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
    const result = await AuthService.getUserProfile(req.user.id);

    if (!result.success) {
        return ApiResponse.notFound(res, result.message);
    }

    return ApiResponse.success(res, RESPONSE_MESSAGES.SUCCESS, result.data);
});

module.exports = {
    register,
    login,
    logout,
    getMe,
};

