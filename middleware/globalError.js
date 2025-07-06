const globalErrorHandler = (err, req, res, _next) => {
  console.error(err ? err.stack : undefined);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err ? err.message : undefined
  });
};

module.exports = globalErrorHandler;
