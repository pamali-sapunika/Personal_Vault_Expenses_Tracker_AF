// Middleware to handle 404 Not Found errors
const notFound = (req, res, next) => {
    // Create a new error with the requested URL
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error); // Pass the error to the next middleware
  };
  
  // Middleware to handle general errors
  const errorHandler = (err, req, res, next) => {
    // Set status code (500 for server errors, unless another status is already set)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
  
    // Send error response (hide stack trace in production)
    res.json({
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
  };
  
  module.exports = { notFound, errorHandler };
  