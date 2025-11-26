const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Travel Booking API',
      version: '1.0.0',
      description: 'A REST API for Travel Booking',
    },
    servers: [
      {
        // url: 'http://localhost:3000/api/v1',
        url: 'http://192.168.1.37:3000/api/v1',
        description: 'Development servers',
      },
    ],
  },
  apis: ['./routes/*.js', './utils/swagger/*.yaml'],
};

const swaggerDocs = swaggerJsDoc(options);

module.exports = swaggerDocs;