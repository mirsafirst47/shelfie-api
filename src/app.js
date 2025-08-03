const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const productRoutes = require('../routes/products');
const customerRoutes = require('../routes/customers');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'ShelFie API - Smart Food Safety Platform',
    version: '1.0.0',
    status: 'running'
  });
});

app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;