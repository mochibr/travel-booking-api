const swaggerJsDoc = require('swagger-jsdoc');
const config = require('./env.config');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Travel Booking API',
            version: '1.0.0',
            description: 'A comprehensive Travel Booking API with user authentication and booking management',
            contact: {
                name: 'API Support',
                email: 'support@travelbooking.com',
            },
            license: {
                name: 'ISC',
            },
        },
        servers: [
            {
                url: `http://localhost:${config.port}/api/v1`,
                description: 'Development server',
            },
            {
                url: 'https://api.travelbooking.com/api/v1',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'User ID',
                        },
                        name: {
                            type: 'string',
                            description: 'User full name',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address',
                        },
                        phone: {
                            type: 'string',
                            description: 'User phone number',
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updated_at: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        message: {
                            type: 'string',
                        },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    field: {
                                        type: 'string',
                                    },
                                    message: {
                                        type: 'string',
                                    },
                                },
                            },
                        },
                    },
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true,
                        },
                        message: {
                            type: 'string',
                        },
                        data: {
                            type: 'object',
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: 'Authentication',
                description: 'User authentication endpoints',
            },
            {
                name: 'Health',
                description: 'API health check endpoints',
            },
        ],
    },
    apis: ['./routes/**/*.js', './controllers/**/*.js'], // Path to files with annotations
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

module.exports = swaggerSpec;

