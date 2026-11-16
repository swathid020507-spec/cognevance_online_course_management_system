// 404 Not Found Middleware
const notFound = (req, res, next) => {
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Server Internal Error';
  let errors = null;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    message = `Resource not found with id of ${err.value}`;
    statusCode = 404;
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    if (field === 'student' || field === 'course') {
      message = 'You are already enrolled in this course.';
    } else {
      message = `A record with this ${field || 'value'} already exists.`;
    }
    statusCode = 400;
  }

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    errors = Object.values(err.errors).map((val) => val.message);
    message = errors.join(', ');
    statusCode = 400;
  }

  // Handle JWT Errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token. Please authenticate again.';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Your session has expired. Please log in again.';
    statusCode = 401;
  }

  // Handle Mongoose Connection & Server Selection Errors
  if (
    err.name === 'MongooseServerSelectionError' ||
    (err.name === 'MongooseError' && err.message.includes('buffering timed out'))
  ) {
    message = 'Database service is currently unreachable. Please ensure MongoDB is started locally or check your MONGO_URI in .env.';
    statusCode = 503;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
