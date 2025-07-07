const jwt = require('jsonwebtoken');
const authenticate = require('../../../middleware/authenticate');
const User = require('../../../models/User');

jest.mock('jsonwebtoken');
jest.mock('../../../models/User');

describe('authenticate middleware', () => {
  let req, res, next;
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('successful authentication', () => {
    it('should authenticate user with valid token', async () => {
      const mockUser = { id: 'user-123', name: 'John Doe', email: 'john@example.com' };
      const mockDecoded = { userId: 'user-123' };

      req.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue(mockDecoded);
      User.findByPk.mockResolvedValue(mockUser);

      await authenticate(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', JWT_SECRET);
      expect(User.findByPk).toHaveBeenCalledWith('user-123');
      expect(req.user).toBe(mockUser);
      expect(req.userId).toBe('user-123');
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('missing authorization header', () => {
    it('should return 401 when no authorization header', async () => {
      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access token required' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header does not start with Bearer', async () => {
      req.headers.authorization = 'Basic invalid-format';

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access token required' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('invalid token', () => {
    it('should return 401 for invalid token', async () => {
      req.headers.authorization = 'Bearer invalid-token';
      jwt.verify.mockImplementation(() => {
        const error = new Error('Invalid token');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for expired token', async () => {
      req.headers.authorization = 'Bearer expired-token';
      jwt.verify.mockImplementation(() => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token expired' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('user not found', () => {
    it('should return 401 when user not found', async () => {
      const mockDecoded = { userId: 'non-existent-user' };

      req.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue(mockDecoded);
      User.findByPk.mockResolvedValue(null);

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token - user not found' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('unexpected errors', () => {
    it('should return 500 for unexpected errors', async () => {
      req.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication failed' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 500 when User.findByPk throws error', async () => {
      const mockDecoded = { userId: 'user-123' };

      req.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue(mockDecoded);
      User.findByPk.mockRejectedValue(new Error('Database error'));

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication failed' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
