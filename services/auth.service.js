const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');
const { generateToken, getTokenExpiration } = require('../utils/jwt');
const logger = require('../config/logger.config');

/**
 * Authentication Service Layer
 * Handles all business logic for authentication
 */
class AuthService {
    /**
     * Register a new user
     */
    static async registerUser(userData) {
        try {
            const { email } = userData;

            // Check if user exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return {
                    success: false,
                    message: 'User already exists with this email',
                };
            }

            // Create user
            const userId = await User.create(userData);
            
            // Generate token
            const token = generateToken(userId);
            
            // Get user data (without password)
            const user = await User.findById(userId);

            logger.info(`New user registered: ${email}`);

            return {
                success: true,
                data: { user, token },
            };
        } catch (error) {
            logger.error(`Registration error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Login user
     */
    static async loginUser(email, password) {
        try {
            // Check if user exists
            const user = await User.findByEmail(email);
            if (!user) {
                return {
                    success: false,
                    message: 'Invalid credentials',
                };
            }

            // Verify password
            const isPasswordValid = await User.verifyPassword(password, user.password);
            if (!isPasswordValid) {
                return {
                    success: false,
                    message: 'Invalid credentials',
                };
            }

            // Generate token
            const token = generateToken(user.id);

            // Remove password from response
            delete user.password;

            logger.info(`User logged in: ${email}`);

            return {
                success: true,
                data: { user, token },
            };
        } catch (error) {
            logger.error(`Login error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Logout user by blacklisting token
     */
    static async logoutUser(token) {
        try {
            const expiresAt = getTokenExpiration(token);
            await TokenBlacklist.add(token, expiresAt);
            
            logger.info('User logged out successfully');
            
            return {
                success: true,
                message: 'Logout successful',
            };
        } catch (error) {
            logger.error(`Logout error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get user profile
     */
    static async getUserProfile(userId) {
        try {
            const user = await User.findById(userId);
            
            if (!user) {
                return {
                    success: false,
                    message: 'User not found',
                };
            }

            return {
                success: true,
                data: { user },
            };
        } catch (error) {
            logger.error(`Get profile error: ${error.message}`);
            throw error;
        }
    }
}

module.exports = AuthService;

