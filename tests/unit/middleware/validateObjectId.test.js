const validateObjectId = require('../../../middleware/validateObjectId');
const { v4: uuidv4 } = require('uuid');

describe('validateObjectId middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('valid UUID scenarios', () => {
    it('should call next() for valid UUID v4', () => {
      const validUuid = uuidv4();
      req.params.id = validUuid;

      validateObjectId(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next() for valid UUID v1', () => {
      const validUuidV1 = '550e8400-e29b-41d4-a716-446655440000';
      req.params.id = validUuidV1;

      validateObjectId(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next() for valid UUID with uppercase letters', () => {
      const validUuid = '550E8400-E29B-41D4-A716-446655440000';
      req.params.id = validUuid;

      validateObjectId(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('invalid UUID scenarios', () => {
    it('should return 400 for invalid UUID format', () => {
      req.params.id = 'invalid-uuid';

      validateObjectId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid ID format: \'invalid-uuid\'. Expected a valid UUID.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for UUID with wrong length', () => {
      req.params.id = '550e8400-e29b-41d4-a716-44665544000';

      validateObjectId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid ID format: \'550e8400-e29b-41d4-a716-44665544000\'. Expected a valid UUID.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for UUID with invalid characters', () => {
      req.params.id = '550e8400-e29b-41d4-a716-44665544000g';

      validateObjectId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid ID format: \'550e8400-e29b-41d4-a716-44665544000g\'. Expected a valid UUID.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for UUID without dashes', () => {
      req.params.id = '550e8400e29b41d4a716446655440000';

      validateObjectId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid ID format: \'550e8400e29b41d4a716446655440000\'. Expected a valid UUID.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for empty string ID', () => {
      req.params.id = '';

      validateObjectId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid ID format: \'\'. Expected a valid UUID.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for missing ID (undefined)', () => {
      req.params.id = undefined;

      validateObjectId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid ID format: \'undefined\'. Expected a valid UUID.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for null ID', () => {
      req.params.id = null;

      validateObjectId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid ID format: \'null\'. Expected a valid UUID.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for numeric ID', () => {
      req.params.id = 123;

      validateObjectId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid ID format: \'123\'. Expected a valid UUID.'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle params object without id property', () => {
      req.params = {};

      validateObjectId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid ID format: \'undefined\'. Expected a valid UUID.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle missing params object', () => {
      req.params = undefined;

      validateObjectId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid ID format: \'undefined\'. Expected a valid UUID.'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
