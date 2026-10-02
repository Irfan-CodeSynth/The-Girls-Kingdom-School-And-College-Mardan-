require('dotenv').config();

// Default Atlas URI — override via MONGO_URI environment variable in Vercel/Render
const DEFAULT_MONGO_URI =
  'mongodb+srv://admin_gkc:KingdomPass2026!@girls-kingdom-db.l9i91cn.mongodb.net/girls-kingdom-college?retryWrites=true&w=majority&appName=girls-kingdom-db';

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || DEFAULT_MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'the-girls-kingdom-school-and-college-mardan-jwt-super-secret-key-2026',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '90d',
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_NAME: process.env.ADMIN_NAME,
  NODE_ENV: process.env.NODE_ENV,
  UPLOAD_PATH: process.env.UPLOAD_PATH || 'uploads'
};
