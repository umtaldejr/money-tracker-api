// Global error handler middleware
const globalErrorHandler = (err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
};

module.exports = globalErrorHandler;
