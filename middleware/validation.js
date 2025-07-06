const validator = require('validator');

class ValidationMiddleware {
  static validateObjectId(req, res, next) {
    const { id } = req.params;

    if (!validator.isUUID(id)) {
      return res.status(400).json({
        error: `Invalid ID format: '${id}'. Expected a valid UUID.`
      });
    }

    next();
  }
}

module.exports = ValidationMiddleware;
