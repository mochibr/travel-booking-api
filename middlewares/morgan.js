const morgan = require('morgan');
const logger = require('../config/logger.config');
const config = require('../config/env.config');

// Custom token for morgan to log response time
morgan.token('message', (req, res) => res.locals.errorMessage || '');

// Custom format
const getIpFormat = () => 
    config.env === 'production' ? ':remote-addr - ' : '';

const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`;

// Success handler
const successHandler = morgan(successResponseFormat, {
    skip: (req, res) => res.statusCode >= 400,
    stream: { write: (message) => logger.http(message.trim()) },
});

// Error handler
const errorHandler = morgan(errorResponseFormat, {
    skip: (req, res) => res.statusCode < 400,
    stream: { write: (message) => logger.error(message.trim()) },
});

module.exports = {
    successHandler,
    errorHandler,
};

