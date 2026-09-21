const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: isDev ? 5000 : 100, 
  standardHeaders: true, 
  legacyHeaders: false, 
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: isDev ? 1000 : 10, 
  standardHeaders: true, 
  legacyHeaders: false, 
  message: { success: false, message: 'Too many login attempts, please try again later.' }
});

module.exports = { generalLimiter, authLimiter };
