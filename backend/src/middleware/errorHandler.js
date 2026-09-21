const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    error.statusCode = 400;
    error.message = message;
  }

  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error.statusCode = 409;
    error.message = message;
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error.statusCode = 400;
    error.message = message;
  }
  
  if (err.name === 'JsonWebTokenError') {
      const message = 'Invalid Token. Please log in again.';
      error.statusCode = 401;
      error.message = message;
  }
  
  if (err.name === 'TokenExpiredError') {
      const message = 'Your token has expired. Please log in again.';
      error.statusCode = 401;
      error.message = message;
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message || 'Server Error',
    ...(env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
