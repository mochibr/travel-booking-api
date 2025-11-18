const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authWebRoutes = require('./routes/authWebRoutes');
const authAdminRoutes = require('./routes/authAdminRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const locationRoutes = require('./routes/locationRoutes');
const driverRoutes = require('./routes/driverRoutes');
const swaggerUI = require('swagger-ui-express');
const swaggerDocs = require('./utils/swagger');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());
// app.use(cors({
//   origin: ['http://192.168.1.29:3000'],
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   credentials: true
// }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Set EJS as view engine for email templates
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Swagger documentation
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Routes
app.use('/api/v1/web/auth', authWebRoutes);
app.use('/api/v1/admin/auth', authAdminRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/hotels', hotelRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/drivers', driverRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: process.env.APP_NAME,
    environment: process.env.NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: `Welcome to ${process.env.APP_NAME} API`,
    version: '1.0.0',
    documentation: {
      admin: `/api-docs/admin`,
      web: `/api-docs/web`
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 Error:', error);

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File too large. Maximum size is 5MB.'
    });
  }

  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      error: 'Only image files are allowed for profile pictures.'
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('\n🚀 Server started successfully!');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🏠 App Name: ${process.env.APP_NAME}`);
  console.log('\n📚 API Documentation:');
  console.log(`   - Web API: http://localhost:${PORT}/api-docs/web`);
  console.log(`   - Admin API: http://localhost:${PORT}/api-docs/admin`);
  console.log(`\n❤️  Health Check: http://localhost:${PORT}/health`);
  console.log('\n✅ Server is ready to handle requests...\n');
});