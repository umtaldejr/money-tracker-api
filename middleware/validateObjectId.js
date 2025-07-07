const validator = require('validator');

const validateObjectId = (req, res, next) => {
  try {
    const { id } = req.params || {};

    if (!validator.isUUID(id)) {
      return res.status(400).json({
        error: `Invalid ID format: '${id}'. Expected a valid UUID.`
      });
    }

    next();
  } catch {
    return res.status(400).json({
      error: `Invalid ID format: '${req.params?.id}'. Expected a valid UUID.`
    });
  }
};

module.exports = validateObjectId;
