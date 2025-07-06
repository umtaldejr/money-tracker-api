const request = require('supertest');
const app = require('../app');

describe('Money Tracker API', () => {
  describe('GET /', () => {
    it('should return welcome message with undefined version when no commit hash', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Welcome to Money Tracker API',
        version: undefined,
        environment: 'test'
      });
    });

    it('should return welcome message with version when commit hash is set', async () => {
      const originalCommitHash = process.env.COMMIT_HASH;
      process.env.COMMIT_HASH = 'test-commit-hash';

      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Welcome to Money Tracker API',
        version: 'test-commit-hash',
        environment: 'test'
      });

      if (originalCommitHash) {
        process.env.COMMIT_HASH = originalCommitHash;
      } else {
        delete process.env.COMMIT_HASH;
      }
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
    it('should return v1 API info with undefined version when no commit hash', async () => {
      const response = await request(app)
        .get('/api/v1')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Welcome to Money Tracker API',
        version: undefined,
        environment: 'test',
        apiVersion: 'v1'
      });
    });

    it('should return v1 API info with version when commit hash is set', async () => {
      const originalCommitHash = process.env.COMMIT_HASH;
      process.env.COMMIT_HASH = 'test-commit-hash-v1';

      const response = await request(app)
        .get('/api/v1')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Welcome to Money Tracker API',
        version: 'test-commit-hash-v1',
        environment: 'test',
        apiVersion: 'v1'
      });

      if (originalCommitHash) {
        process.env.COMMIT_HASH = originalCommitHash;
      } else {
        delete process.env.COMMIT_HASH;
      }
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
