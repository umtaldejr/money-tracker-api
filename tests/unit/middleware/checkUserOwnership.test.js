const checkUserOwnership = require('../../../middleware/checkUserOwnership');

describe('checkUserOwnership middleware', () => {
  let req, res, next;
  let consoleErrorSpy;

  beforeEach(() => {
    req = {
      params: {},
      userId: undefined
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    // Mock console.error to avoid cluttering test output
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('successful ownership check', () => {
    it('should allow access when user owns the resource', () => {
      req.params.id = 'user-123';
      req.userId = 'user-123';

      checkUserOwnership(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('access denied scenarios', () => {
    it('should deny access when user tries to access another user\'s data', () => {
      req.params.id = 'user-456';
      req.userId = 'user-123';

      checkUserOwnership(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Access denied - you can only access your own data'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should deny access when userId is undefined', () => {
      req.params.id = 'user-123';
      req.userId = undefined;

      checkUserOwnership(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Access denied - you can only access your own data'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should deny access when params.id is undefined', () => {
      req.params.id = undefined;
      req.userId = 'user-123';

      checkUserOwnership(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Access denied - you can only access your own data'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should deny access when both are undefined', () => {
      req.params.id = undefined;
      req.userId = undefined;

      checkUserOwnership(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Access denied - you can only access your own data'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('type coercion scenarios', () => {
    it('should handle string vs number comparison correctly', () => {
      req.params.id = '123';
      req.userId = 123;

      checkUserOwnership(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Access denied - you can only access your own data'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle null values', () => {
      req.params.id = null;
      req.userId = null;

      checkUserOwnership(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Access denied - you can only access your own data'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle unexpected errors gracefully', () => {
      Object.defineProperty(req, 'params', {
        get: () => {
          throw new Error('Unexpected error');
        }
      });

      checkUserOwnership(req, res, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith('User ownership check error:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Access check failed'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
