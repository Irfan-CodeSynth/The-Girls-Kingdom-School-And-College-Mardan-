const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Not authorized to access this route');
  }

  try {
    const secret = env.JWT_SECRET || process.env.JWT_SECRET || 'the-girls-kingdom-school-and-college-mardan-jwt-super-secret-key-2026';
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    throw ApiError.unauthorized('Token is invalid or expired');
  }
};

module.exports = protect;
