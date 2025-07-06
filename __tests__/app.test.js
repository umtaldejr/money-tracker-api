const request = require('supertest');
const app = require('../app');

describe('Money Tracker API', () => {
  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Welcome to Money Tracker API',
        version: '1.0.0',
        environment: 'test'
      });
    });

    it('should return JSON content type', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).not.toHaveProperty('version');
    });
  });

  describe('GET /api/v1', () => {
    it('should return v1 API info', async () => {
      const response = await request(app)
        .get('/api/v1')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Welcome to Money Tracker API',
        version: '1.0.0',
        environment: 'test',
        apiVersion: 'v1'
      });
    });
  });



  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Route not found',
        message: 'Cannot GET /non-existent-route'
      });
    });

    it('should handle different HTTP methods', async () => {
      const response = await request(app)
        .post('/non-existent-route')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Route not found',
        message: 'Cannot POST /non-existent-route'
      });
    });
  });
});
