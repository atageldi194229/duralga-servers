const error = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // Log to console for dev
  console.error(err);

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
    errorCode: error.errorCode || -1,
    // err,
  });
};

module.exports = error;