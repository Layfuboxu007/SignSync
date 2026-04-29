/**
 * Global error handling middleware for Express.
 * Ensures consistent JSON error responses across the entire application.
 */
const errorHandler = (err, req, res, next) => {
  console.error("🔥 [Global Error]:", err);

  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    status,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
