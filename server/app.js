require('dotenv').config({ path: './config.env' });
const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/connectDB');
const path = require('path');

const app = express();

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
console.log('Serving uploads from:', path.join(process.cwd(), 'uploads'));
// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Request Headers:', req.headers);
    console.log('Request Body:', req.body);
    next();
});

// Connect to MongoDB
connectDB();

// Import routes
const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurantRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/admin');

// Log available routes
console.log('\n=== Available Routes ===');
console.log('Auth Routes:');
console.log('  POST /api/auth/register');
console.log('  POST /api/auth/login');
console.log('  POST /api/auth/verify-admin-code');
console.log('  POST /api/auth/register-admin');

console.log('\nRestaurant Routes:');
console.log('  POST /api/restaurants');
console.log('  GET /api/restaurants');
console.log('  GET /api/restaurants/:id/menu');

console.log('\nAdmin Routes:');
console.log('  GET /api/admin/orders');
console.log('  PATCH /api/admin/orders/:orderId/status');
console.log('  GET /api/admin/restaurants');
console.log('  POST /api/admin/restaurants');
console.log('  PATCH /api/admin/restaurants/:restaurantId');
console.log('========================\n');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Debug middleware to log all registered routes
app.use((req, res, next) => {
  console.log('\n=== Current Request ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Base URL:', req.baseUrl);
  console.log('Original URL:', req.originalUrl);
  console.log('Path:', req.path);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('========================\n');
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    // Check for multer errors
    if (err.name === 'MulterError') {
        console.error('Multer error:', err);
        return res.status(400).json({ message: 'File upload error', error: err.message });
    }

    console.error('Error:', err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 handler
app.use((req, res) => {
    console.log('404 - Route not found:', req.method, req.url);
    console.log('Available routes:', app._router.stack
        .filter(r => r.route)
        .map(r => `${Object.keys(r.route.methods).join(', ').toUpperCase()} ${r.route.path}`)
    );
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('JWT_SECRET is set:', !!process.env.JWT_SECRET);
});
