require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const User = require('./modules/users/user.model');
const { ROLES } = require('./utils/constants');

const PORT = process.env.PORT || env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

connectDB().then(async () => {
  // Ensure default admin exists for immediate access
  try {
    const adminExists = await User.findOne({ role: ROLES.ADMIN });
    if (!adminExists) {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@girlskingdom.edu';
      const adminPass = process.env.ADMIN_PASSWORD || 'Admin@123456';
      await User.create({
        fullName: process.env.ADMIN_NAME || 'System Administrator',
        email: adminEmail,
        password: adminPass,
        role: ROLES.ADMIN,
        isActive: true
      });
      console.log(`Default administrator seeded: ${adminEmail} / ${adminPass}`);
    }

    // Ensure initial demo records exist if database is empty
    const seedInitialDataIfEmpty = require('../seeds/initialSeed');
    await seedInitialDataIfEmpty();
  } catch (seedErr) {
    console.warn('Auto-seed check notice:', seedErr.message);
  }
}).catch(err => {
  console.warn('Database initialization deferred:', err.message);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥', err.name, err.message);
  if (!process.env.VERCEL) {
    server.close(() => {
      process.exit(1);
    });
  }
});

module.exports = app;
module.exports.server = server;
