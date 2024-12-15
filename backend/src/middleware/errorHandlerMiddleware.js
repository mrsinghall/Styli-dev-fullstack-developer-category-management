// Centralized error-handling middleware
function errorHandler(err, req, res, next) {
  console.log("===>", err.name);
  if (err.name == "ValidationError") {
    err.statusCode = 400;
  }
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  // Log the error stack for debugging (in production, you may use a logging service)
  console.error(err.stack);

  res.status(statusCode).json({
    statusCode,
    message,
    data: {},
  });
}

module.exports = errorHandler;
