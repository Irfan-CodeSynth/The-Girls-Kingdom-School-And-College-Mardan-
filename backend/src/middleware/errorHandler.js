const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.statusCode = err.statusCode || 500;

  let rawMessage = err.message || error.message || 'Server Error';
  if (typeof rawMessage === 'object') {
    rawMessage = rawMessage.message || JSON.stringify(rawMessage);
  }
  error.message = String(rawMessage);

  if (err.name === 'CastError') {
    error.statusCode = 400;
    error.message = `Resource not found. Invalid: ${err.path}`;
  }

  if (err.code === 11000) {
    error.statusCode = 409;
    error.message = 'Duplicate field value entered';
  }

  if (err.name === 'ValidationError') {
    error.statusCode = 400;
    error.message = Object.values(err.errors || {}).map(val => val.message).join(', ');
  }
  
  if (err.name === 'JsonWebTokenError') {
    error.statusCode = 401;
    error.message = 'Invalid Token. Please log in again.';
  }
  
  if (err.name === 'TokenExpiredError') {
    error.statusCode = 401;
    error.message = 'Your token has expired. Please log in again.';
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
