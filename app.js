const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Money Tracker API',
    version: require('../../package.json').version,
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
