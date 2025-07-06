const globalErrorHandler = require('../../../middleware/globalError');

describe('globalErrorHandler middleware', () => {
  let req, res, next;
  let consoleErrorSpy;

  beforeEach(() => {
    req = {
      method: 'GET',
      url: '/test',
      headers: {}
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

  describe('error handling', () => {
    it('should handle generic errors', () => {
      const error = new Error('Something went wrong');
      error.stack = 'Error: Something went wrong\n    at test.js:1:1';

      globalErrorHandler(error, req, res, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith(error.stack);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Something went wrong!',
        message: 'Something went wrong'
      });
    });

    it('should handle errors with custom messages', () => {
      const error = new Error('Custom error message');
      error.stack = 'Error: Custom error message\n    at test.js:1:1';

      globalErrorHandler(error, req, res, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith(error.stack);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Something went wrong!',
        message: 'Custom error message'
      });
    });

    it('should handle errors without stack traces', () => {
      const error = new Error('No stack trace');
      delete error.stack;

      globalErrorHandler(error, req, res, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith(undefined);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Something went wrong!',
        message: 'No stack trace'
      });
    });

    it('should handle errors with empty messages', () => {
      const error = new Error('');
      error.stack = 'Error: \n    at test.js:1:1';

      globalErrorHandler(error, req, res, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith(error.stack);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Something went wrong!',
        message: ''
      });
    });
  });

  describe('different error types', () => {
    it('should handle TypeError', () => {
      const error = new TypeError('Cannot read property of undefined');
      error.stack = 'TypeError: Cannot read property of undefined\n    at test.js:1:1';

      globalErrorHandler(error, req, res, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith(error.stack);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Something went wrong!',
        message: 'Cannot read property of undefined'
      });
    });

    it('should handle ReferenceError', () => {
      const error = new ReferenceError('Variable is not defined');
      error.stack = 'ReferenceError: Variable is not defined\n    at test.js:1:1';

      globalErrorHandler(error, req, res, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith(error.stack);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Something went wrong!',
        message: 'Variable is not defined'
      });
    });

    it('should handle SyntaxError', () => {
      const error = new SyntaxError('Unexpected token');
      error.stack = 'SyntaxError: Unexpected token\n    at test.js:1:1';

      globalErrorHandler(error, req, res, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith(error.stack);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Something went wrong!',
        message: 'Unexpected token'
      });
    });
  });

  describe('error objects with additional properties', () => {
    it('should handle errors with custom properties', () => {
      const error = new Error('Database connection failed');
      error.code = 'ECONNREFUSED';
      error.errno = -61;
      error.stack = 'Error: Database connection failed\n    at test.js:1:1';

      globalErrorHandler(error, req, res, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith(error.stack);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Something went wrong!',
        message: 'Database connection failed'
      });
    });

    it('should handle errors with status codes', () => {
      const error = new Error('Validation failed');
      error.statusCode = 400;
      error.stack = 'Error: Validation failed\n    at test.js:1:1';

      globalErrorHandler(error, req, res, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith(error.stack);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Something went wrong!',
        message: 'Validation failed'
      });
    });
  });

  describe('edge cases', () => {
    it('should handle null error', () => {
      const error = null;

      globalErrorHandler(error, req, res, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith(undefined);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Something went wrong!',
        message: undefined
      });
    });

    it('should handle undefined error', () => {
      const error = undefined;

      globalErrorHandler(error, req, res, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith(undefined);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Something went wrong!',
        message: undefined
      });
    });

    it('should handle string error', () => {
      const error = 'String error message';

      globalErrorHandler(error, req, res, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith(undefined);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Something went wrong!',
        message: undefined
      });
    });

    it('should handle object error without message', () => {
      const error = { code: 'CUSTOM_ERROR', details: 'Some details' };

      globalErrorHandler(error, req, res, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith(undefined);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Something went wrong!',
        message: undefined
      });
    });
  });

  describe('response handling', () => {
    it('should not call next() function', () => {
      const error = new Error('Test error');

      globalErrorHandler(error, req, res, next);

      expect(next).not.toHaveBeenCalled();
    });

    it('should always return 500 status code', () => {
      const errors = [
        new Error('Error 1'),
        new TypeError('Error 2'),
        new ReferenceError('Error 3')
      ];

      errors.forEach(error => {
        globalErrorHandler(error, req, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    it('should always return consistent error structure', () => {
      const error = new Error('Test error');

      globalErrorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        error: 'Something went wrong!',
        message: 'Test error'
      });
    });
  });
});
