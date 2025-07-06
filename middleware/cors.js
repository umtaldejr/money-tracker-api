const cors = require('cors');

// CORS security configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080'],
  credentials: true,
  optionsSuccessStatus: 200
};

const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware;
