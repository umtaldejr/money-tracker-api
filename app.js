const express = require('express');
const morgan = require('morgan');

const corsMiddleware = require('./middleware/cors');
const securityHeaders = require('./middleware/helmet');
const rateLimiter = require('./middleware/rateLimit');
const sanitizeInput = require('./middleware/sanitization');

const app = express();

app.use(corsMiddleware);
app.use(securityHeaders);
app.use(rateLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(sanitizeInput);

app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Money Tracker API',
    version: require('../../package.json').version,
    environment: process.env.NODE_ENV || 'development',
    status: 'running'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

module.exports = app;
