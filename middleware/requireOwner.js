const requireOwner = (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!id || !userId || id !== userId) {
      return res.status(403).json({ error: 'Access denied - you can only access your own data' });
    }

    next();
  } catch (error) {
    console.error('User ownership check error:', error);
    res.status(500).json({ error: 'Access check failed' });
  }
};

module.exports = requireOwner;
