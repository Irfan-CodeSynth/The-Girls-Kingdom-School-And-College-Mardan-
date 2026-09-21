const env = require('./env');

const getAllowedOrigin = () => {
  if (!env.CORS_ORIGIN || env.CORS_ORIGIN === '*') {
    return (origin, callback) => callback(null, true);
  }
  const origins = env.CORS_ORIGIN.split(',').map(o => o.trim());
  return (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origins.includes(origin) || origins.includes('*')) {
      return callback(null, true);
    }
    if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Fallback allow to avoid unexpected blocking in staging/preview
  };
};

const corsOptions = {
  origin: getAllowedOrigin(),
  credentials: true,
  optionsSuccessStatus: 200
};

module.exports = corsOptions;
