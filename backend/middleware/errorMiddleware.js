/**
 * Middleware to handle 404 (Not Found) routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Central Error Handling Middleware
 * Formats errors nicely for the frontend instead of sending raw HTML crash pages
 */
const errorHandler = (err, req, res, next) => {
  // If the response status is 200 OK but an error occurred, set to 500 Server Error
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Handle invalid MongoDB ObjectId error (e.g., /api/items/invalid-id)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Item not found with the requested ID';
  }

  // Handle Mongoose schema validation errors (e.g. missing required field)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Show stack trace only during development, hide it in production
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
