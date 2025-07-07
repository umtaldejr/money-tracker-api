const globalErrorHandler = (err, req, res, _next) => {
  console.error(err?.stack || 'Unknown error occurred');
  res.status(500).json({
    error: 'Something went wrong!',
    ...(err?.message && { message: err.message })
  });
};

module.exports = globalErrorHandler;
