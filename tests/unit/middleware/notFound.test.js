const notFoundHandler = require('../../../middleware/notFound');

describe('notFoundHandler middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      method: 'GET',
      originalUrl: '/test',
      url: '/test',
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('basic functionality', () => {
    it('should return 404 for GET request', () => {
      req.method = 'GET';
      req.originalUrl = '/non-existent-route';

      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Route not found',
        message: 'Cannot GET /non-existent-route'
      });
    });

    it('should return 404 for POST request', () => {
      req.method = 'POST';
      req.originalUrl = '/api/non-existent';

      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Route not found',
        message: 'Cannot POST /api/non-existent'
      });
    });

    it('should return 404 for PUT request', () => {
      req.method = 'PUT';
      req.originalUrl = '/api/users/123';

      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Route not found',
        message: 'Cannot PUT /api/users/123'
      });
    });

    it('should return 404 for DELETE request', () => {
      req.method = 'DELETE';
      req.originalUrl = '/api/users/456';

      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Route not found',
        message: 'Cannot DELETE /api/users/456'
      });
    });

    it('should return 404 for PATCH request', () => {
      req.method = 'PATCH';
      req.originalUrl = '/api/users/789';

      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Route not found',
        message: 'Cannot PATCH /api/users/789'
      });
    });
  });

  describe('different URL patterns', () => {
    it('should handle root path', () => {
      req.method = 'GET';
      req.originalUrl = '/';

      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Route not found',
        message: 'Cannot GET /'
      });
    });

    it('should handle nested paths', () => {
      req.method = 'GET';
      req.originalUrl = '/api/v1/users/123/posts/456';

      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Route not found',
        message: 'Cannot GET /api/v1/users/123/posts/456'
      });
    });

    it('should handle paths with query parameters', () => {
      req.method = 'GET';
      req.originalUrl = '/api/users?page=1&limit=10';

      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Route not found',
        message: 'Cannot GET /api/users?page=1&limit=10'
      });
    });

    it('should handle paths with fragments', () => {
      req.method = 'GET';
      req.originalUrl = '/api/users#section1';

      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Route not found',
        message: 'Cannot GET /api/users#section1'
      });
    });

    it('should handle paths with special characters', () => {
      req.method = 'GET';
      req.originalUrl = '/api/users/john@example.com';

      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Route not found',
        message: 'Cannot GET /api/users/john@example.com'
      });
    });

    it('should handle encoded URLs', () => {
      req.method = 'GET';
      req.originalUrl = '/api/users/john%40example.com';

      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Route not found',
        message: 'Cannot GET /api/users/john%40example.com'
      });
    });
  });

  describe('HTTP methods', () => {
    it('should handle OPTIONS request', () => {
      req.method = 'OPTIONS';
      req.originalUrl = '/api/users';

      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Route not found',
        message: 'Cannot OPTIONS /api/users'
      });
    });

    it('should handle HEAD request', () => {
      req.method = 'HEAD';
      req.originalUrl = '/api/users';

      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Route not found',
        message: 'Cannot HEAD /api/users'
      });
    });

    it('should handle custom HTTP methods', () => {
      req.method = 'CUSTOM';
      req.originalUrl = '/api/users';

      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Route not found',
        message: 'Cannot CUSTOM /api/users'
      });
    });
  });

  describe('edge cases', () => {
    it('should handle missing method', () => {
      req.method = undefined;
      req.originalUrl = '/api/users';

      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Route not found',
        message: 'Cannot undefined /api/users'
      });
    });

    it('should handle missing originalUrl', () => {
      req.method = 'GET';
      req.originalUrl = undefined;

      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Route not found',
        message: 'Cannot GET undefined'
      });
    });

    it('should handle empty originalUrl', () => {
      req.method = 'GET';
      req.originalUrl = '';

      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Route not found',
        message: 'Cannot GET '
      });
    });

    it('should handle null values', () => {
      req.method = null;
      req.originalUrl = null;

      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Route not found',
        message: 'Cannot null null'
      });
    });
  });

  describe('response structure', () => {
    it('should always return consistent error structure', () => {
      req.method = 'GET';
      req.originalUrl = '/test';

      notFoundHandler(req, res);

      expect(res.json).toHaveBeenCalledWith({
        error: 'Route not found',
        message: 'Cannot GET /test'
      });
    });

    it('should not call next() function', () => {
      req.method = 'GET';
      req.originalUrl = '/test';

      notFoundHandler(req, res);

      expect(next).not.toHaveBeenCalled();
    });

    it('should always return 404 status code', () => {
      const testCases = [
        { method: 'GET', url: '/test1' },
        { method: 'POST', url: '/test2' },
        { method: 'PUT', url: '/test3' },
        { method: 'DELETE', url: '/test4' }
      ];

      testCases.forEach(testCase => {
        req.method = testCase.method;
        req.originalUrl = testCase.url;

        notFoundHandler(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
      });
    });
  });

  describe('case sensitivity', () => {
    it('should handle lowercase methods', () => {
      req.method = 'get';
      req.originalUrl = '/api/users';

      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Route not found',
        message: 'Cannot get /api/users'
      });
    });

    it('should handle mixed case methods', () => {
      req.method = 'GeT';
      req.originalUrl = '/api/users';

      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Route not found',
        message: 'Cannot GeT /api/users'
      });
    });
  });
});
