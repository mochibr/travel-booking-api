const express = require('express');
const cors = require('cors');
const compression = require('compression');
const cron = require('cron');
const swaggerUi = require('swagger-ui-express');

const config = require('./config/env.config');
const logger = require('./config/logger.config');
const swaggerSpec = require('./config/swagger.config');
const { testConnection, closeConnection } = require('./config/database');
const { initializeDatabase } = require('./config/dbInit');
const errorHandler = require('./middlewares/errorHandler');
const { helmetConfig, apiLimiter } = require('./middlewares/security');
const { successHandler, errorHandler: morganErrorHandler } = require('./middlewares/morgan');
const routes = require('./routes');
const TokenBlacklist = require('./models/TokenBlacklist');
const ApiResponse = require('./utils/response.util');

const app = express();

// Trust proxy - important for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmetConfig);

// CORS configuration
app.use(cors({
    origin: config.cors.origin,
    credentials: true,
}));

// Compression middleware
app.use(compression());

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(successHandler);
app.use(morganErrorHandler);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Travel Booking API Documentation',
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Travel Booking API',
        version: '1.0.0',
        documentation: '/api-docs',
    });
});

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// API Routes (v1)
app.use('/api/v1', routes);

// 404 handler
app.use((req, res) => {
    ApiResponse.notFound(res, 'Route not found');
});

// Error handler (must be last)
app.use(errorHandler);

// Cleanup expired tokens daily at midnight
const cleanupJob = new cron.CronJob('0 0 * * *', async () => {
    try {
        await TokenBlacklist.cleanExpired();
        logger.info('Expired tokens cleaned up');
    } catch (error) {
        logger.error(`Token cleanup failed: ${error.message}`);
    }
});

// Initialize server
const startServer = async () => {
    try {
        // Test database connection
        await testConnection();
        
        // Initialize database tables
        await initializeDatabase();
        
        // Start cron job
        cleanupJob.start();
        logger.info('Scheduled jobs started');
        
        // Start server
        const server = app.listen(config.port, () => {
            logger.info(`Server running on port ${config.port}`);
            logger.info(`Environment: ${config.env}`);
            logger.info(`API Documentation: http://localhost:${config.port}/api-docs`);
        });

        // Graceful shutdown
        const gracefulShutdown = async (signal) => {
            logger.info(`${signal} received. Starting graceful shutdown...`);
            
            server.close(async () => {
                logger.info('HTTP server closed');
                
                // Close database connection
                await closeConnection();
                
                // Stop cron jobs
                cleanupJob.stop();
                logger.info('Cron jobs stopped');
                
                process.exit(0);
            });

            // Force shutdown after 30 seconds
            setTimeout(() => {
                logger.error('Forcing shutdown after timeout');
                process.exit(1);
            }, 30000);
        };

        // Handle shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        
    } catch (error) {
        logger.error(`Server initialization failed: ${error.message}`);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});

startServer();

module.exports = app;

