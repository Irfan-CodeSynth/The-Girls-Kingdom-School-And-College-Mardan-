const ApiError = require('../utils/ApiError');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(`User role ${req.user.role} is not authorized to access this route`);
    }
    next();
  };
};

module.exports = authorize;
