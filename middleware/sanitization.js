const sanitizeInput = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    }
    return value;
  };

  const sanitizeObject = (obj, visited = new WeakSet()) => {
    if (obj && typeof obj === 'object') {
      // Check for circular references
      if (visited.has(obj)) {
        return;
      }
      visited.add(obj);

      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeObject(obj[key], visited);
          } else {
            obj[key] = sanitizeValue(obj[key]);
          }
        }
      }

      visited.delete(obj);
    }
  };

  if (req.body) {
    sanitizeObject(req.body);
  }

  if (req.query) {
    sanitizeObject(req.query);
  }

  if (req.params) {
    sanitizeObject(req.params);
  }

  next();
};

module.exports = sanitizeInput;
