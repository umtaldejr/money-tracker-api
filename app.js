const express = require('express');
const morgan = require('morgan');

const HealthController = require('./controllers/healthController');
const InfoController = require('./controllers/infoController');
const corsMiddleware = require('./middleware/cors');
const globalErrorHandler = require('./middleware/globalError');
const securityHeaders = require('./middleware/helmet');
const notFoundHandler = require('./middleware/notFound');
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

app.get('/', InfoController.getApiInfo);
app.get('/health', HealthController.getHealth);

app.use('/api/v1', require('./routes/v1'));

app.use('*', notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
