/**
 * Wraps asynchronous controller functions to catch unhandled promise rejections
 * and automatically pass them to the Express global error handling middleware.
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = catchAsync;
